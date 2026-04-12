# AgentHub Etherlink Demo Payments

This package holds the hackathon-grade Etherlink payment demo contract and helper scripts.

## Commands

```bash
cd crypto
npm run build
npm run deploy:etherlink
npm run settle:etherlink
```

## Required environment

`PRIVATE_KEY`
Wallet used to deploy the contract and submit settlement transactions.

`PAYMENT_CONTRACT_ADDRESS`
Deployed `DemoAgentPayments` contract address used by `settle:etherlink`.

`PAYMENT_RECIPIENT_ADDRESS`
Recipient wallet for the settlement transaction.

`PAYMENT_AMOUNT_ATOMIC`
Amount in Etherlink native-token atomic units. Etherlink XTZ uses 18 decimals.

`PAYMENT_RUN_ID`
Optional AgentHub run id used in the emitted event memo.
