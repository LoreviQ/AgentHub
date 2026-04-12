from __future__ import annotations

import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session
from web3 import HTTPProvider, Web3
from web3.exceptions import Web3Exception

from backend.core.config import get_settings
from backend.db.models import AgentRecord, AgentRunRecord, PaymentSessionRecord
from backend.schemas.agent import AgentPaymentResponse
from backend.schemas.execution import PaymentResultResponse
from backend.schemas.payment import PaymentSessionResponse

ATOMIC_UNITS_PER_XTZ = 10**18
DEMO_AGENT_PAYMENTS_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "runId", "type": "uint256"},
            {"internalType": "address payable", "name": "recipient", "type": "address"},
            {"internalType": "string", "name": "memo", "type": "string"},
        ],
        "name": "settlePayment",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
    }
]


class PaymentError(RuntimeError):
    pass


class PaymentAuthorizationError(PaymentError):
    pass


class PaymentSettlementError(PaymentError):
    pass


@dataclass
class OnchainSettlementResult:
    transaction_hash: str


def xtz_to_atomic(amount_xtz: str) -> int:
    try:
        amount = Decimal(amount_xtz)
    except InvalidOperation as exc:
        raise PaymentError(f"Invalid XTZ amount '{amount_xtz}'.") from exc

    if amount <= 0:
        raise PaymentError("XTZ amount must be greater than zero.")

    atomic = amount * Decimal(ATOMIC_UNITS_PER_XTZ)
    if atomic != atomic.to_integral_value():
        raise PaymentError("XTZ amount exceeds supported precision of 18 decimals.")
    return int(atomic)


def format_xtz_amount(amount_atomic: int | None) -> str | None:
    if amount_atomic is None:
        return None

    amount = Decimal(amount_atomic) / Decimal(ATOMIC_UNITS_PER_XTZ)
    normalized = format(amount.normalize(), "f")
    if "." in normalized:
        normalized = normalized.rstrip("0").rstrip(".")
    return f"{normalized} XTZ"


def build_agent_payment_response(record: AgentRecord) -> AgentPaymentResponse:
    return AgentPaymentResponse(
        enabled=record.payment_enabled,
        chain=record.payment_chain,
        currency=record.payment_currency,
        amount_atomic=record.payment_amount_atomic,
        amount_display=format_xtz_amount(record.payment_amount_atomic),
        decimals=record.payment_decimals,
        recipient_address=record.payment_recipient_address,
    )


def build_payment_result(run: AgentRunRecord) -> PaymentResultResponse:
    return PaymentResultResponse(
        status=run.payment_status or "not_requested",
        chain=run.payment_chain,
        currency=run.payment_currency,
        amount_atomic=run.payment_amount_atomic,
        amount_display=format_xtz_amount(run.payment_amount_atomic),
        recipient_address=run.payment_recipient_address,
        transaction_hash=run.payment_transaction_hash,
        payment_session_id=run.payment_session_id,
        error_message=run.payment_error_message,
    )


def create_payment_session(
    *,
    session: Session,
    wallet_address: str,
    budget_xtz: str,
    expires_in_minutes: int,
    label: str | None = None,
) -> PaymentSessionResponse:
    settings = get_settings()
    now = datetime.now(UTC)
    token = secrets.token_urlsafe(24)
    record = PaymentSessionRecord(
        token_hash=_hash_payment_token(token),
        wallet_address=wallet_address,
        label=label,
        chain=settings.payment_chain,
        currency="XTZ",
        budget_atomic=xtz_to_atomic(budget_xtz),
        spent_atomic=0,
        decimals=18,
        status="active",
        created_at=now,
        expires_at=now + timedelta(minutes=expires_in_minutes),
        metadata_json={},
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return _build_payment_session_response(record=record, payment_token=token)


def authorize_payment_session(
    *,
    session: Session,
    payment_token: str,
    amount_atomic: int,
) -> PaymentSessionRecord:
    record = (
        session.query(PaymentSessionRecord)
        .filter(PaymentSessionRecord.token_hash == _hash_payment_token(payment_token))
        .one_or_none()
    )
    if record is None:
        raise PaymentAuthorizationError("Unknown payment token.")
    if record.status != "active":
        raise PaymentAuthorizationError("Payment token is not active.")
    expires_at = _ensure_utc(record.expires_at)
    if expires_at is not None and expires_at <= datetime.now(UTC):
        record.status = "expired"
        session.commit()
        raise PaymentAuthorizationError("Payment token has expired.")
    if record.spent_atomic + amount_atomic > record.budget_atomic:
        raise PaymentAuthorizationError("Payment token budget exceeded.")
    return record


def settle_agent_run_payment(
    *,
    session: Session,
    record: AgentRecord,
    run: AgentRunRecord,
    payment_token: str | None,
) -> PaymentResultResponse:
    if not record.payment_enabled or record.payment_amount_atomic is None:
        run.payment_status = "not_required"
        run.payment_chain = record.payment_chain
        run.payment_currency = record.payment_currency
        run.payment_amount_atomic = record.payment_amount_atomic
        run.payment_decimals = record.payment_decimals
        run.payment_recipient_address = record.payment_recipient_address
        session.commit()
        session.refresh(run)
        return build_payment_result(run)

    run.payment_chain = record.payment_chain
    run.payment_currency = record.payment_currency
    run.payment_amount_atomic = record.payment_amount_atomic
    run.payment_decimals = record.payment_decimals
    run.payment_recipient_address = record.payment_recipient_address

    if payment_token is None:
        run.payment_status = "not_requested"
        session.commit()
        session.refresh(run)
        return build_payment_result(run)

    authorized_session = authorize_payment_session(
        session=session,
        payment_token=payment_token,
        amount_atomic=record.payment_amount_atomic,
    )
    run.payment_session_id = authorized_session.id
    run.payment_status = "authorized"
    run.payment_error_message = None
    session.commit()

    try:
        settlement = submit_etherlink_settlement(
            run=run,
            recipient_address=record.payment_recipient_address,
            amount_atomic=record.payment_amount_atomic,
        )
    except PaymentSettlementError as exc:
        run.payment_status = "failed"
        run.payment_error_message = str(exc)
        session.commit()
        session.refresh(run)
        raise

    authorized_session.spent_atomic += record.payment_amount_atomic
    authorized_session.last_used_at = datetime.now(UTC)
    run.payment_status = "settled"
    run.payment_transaction_hash = settlement.transaction_hash
    run.payment_settled_at = datetime.now(UTC)
    session.commit()
    session.refresh(run)
    return build_payment_result(run)


def submit_etherlink_settlement(
    *,
    run: AgentRunRecord,
    recipient_address: str | None,
    amount_atomic: int,
) -> OnchainSettlementResult:
    settings = get_settings()
    if not settings.payments_enabled:
        raise PaymentSettlementError("Backend payments are disabled.")
    if not settings.payment_contract_address:
        raise PaymentSettlementError("No payment contract configured.")
    if not settings.payment_signer_private_key:
        raise PaymentSettlementError("No payment signer private key configured.")
    if not recipient_address:
        raise PaymentSettlementError("Agent has no configured payment recipient.")

    try:
        web3 = Web3(HTTPProvider(settings.payment_rpc_url))
        if not web3.is_connected():
            raise PaymentSettlementError("Could not connect to the payment RPC endpoint.")

        signer = web3.eth.account.from_key(settings.payment_signer_private_key)
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(settings.payment_contract_address),
            abi=DEMO_AGENT_PAYMENTS_ABI,
        )

        transaction = contract.functions.settlePayment(
            run.id,
            Web3.to_checksum_address(recipient_address),
            f"AgentHub run {run.id}",
        ).build_transaction(
            {
                "from": signer.address,
                "value": amount_atomic,
                "nonce": web3.eth.get_transaction_count(signer.address),
                "chainId": web3.eth.chain_id,
            }
        )
        transaction["gas"] = web3.eth.estimate_gas(transaction)

        gas_price = web3.eth.gas_price
        if gas_price is not None:
            transaction["gasPrice"] = gas_price

        signed = signer.sign_transaction(transaction)
        tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    except (ValueError, Web3Exception) as exc:
        raise PaymentSettlementError(f"Etherlink settlement failed: {exc}") from exc

    return OnchainSettlementResult(transaction_hash=receipt["transactionHash"].hex())


def _build_payment_session_response(
    *,
    record: PaymentSessionRecord,
    payment_token: str,
) -> PaymentSessionResponse:
    remaining_atomic = record.budget_atomic - record.spent_atomic
    return PaymentSessionResponse(
        session_id=record.id,
        payment_token=payment_token,
        wallet_address=record.wallet_address,
        label=record.label,
        chain=record.chain,
        currency=record.currency,
        budget_atomic=record.budget_atomic,
        budget_display=format_xtz_amount(record.budget_atomic) or "0 XTZ",
        spent_atomic=record.spent_atomic,
        spent_display=format_xtz_amount(record.spent_atomic) or "0 XTZ",
        remaining_atomic=remaining_atomic,
        remaining_display=format_xtz_amount(remaining_atomic) or "0 XTZ",
        status=record.status,
        expires_at=record.expires_at,
    )


def _hash_payment_token(payment_token: str) -> str:
    return hashlib.sha256(payment_token.encode("utf-8")).hexdigest()


def _ensure_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
