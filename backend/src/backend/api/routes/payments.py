from fastapi import APIRouter

from backend.db.session import DbSession
from backend.schemas.payment import PaymentSessionCreateRequest, PaymentSessionResponse
from backend.services.payments import create_payment_session

router = APIRouter(tags=["payments"])


@router.post("/payments/sessions", response_model=PaymentSessionResponse)
async def create_payment_session_route(
    request: PaymentSessionCreateRequest,
    session: DbSession,
) -> PaymentSessionResponse:
    return create_payment_session(
        session=session,
        wallet_address=request.wallet_address,
        budget_xtz=request.budget_xtz,
        expires_in_minutes=request.expires_in_minutes,
        label=request.label,
    )
