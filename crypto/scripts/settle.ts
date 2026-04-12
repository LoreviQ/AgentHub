import { getAddress } from "viem";
import { network } from "hardhat";

const contractAddress = process.env.PAYMENT_CONTRACT_ADDRESS;
const recipientAddress = process.env.PAYMENT_RECIPIENT_ADDRESS;
const amountAtomic = process.env.PAYMENT_AMOUNT_ATOMIC;
const runId = process.env.PAYMENT_RUN_ID ?? "0";

if (!contractAddress) {
  throw new Error("PAYMENT_CONTRACT_ADDRESS is required");
}
if (!recipientAddress) {
  throw new Error("PAYMENT_RECIPIENT_ADDRESS is required");
}
if (!amountAtomic) {
  throw new Error("PAYMENT_AMOUNT_ATOMIC is required");
}

const { viem } = await network.connect({
  network: "etherlink",
});

const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();
const contract = await viem.getContractAt(
  "DemoAgentPayments",
  getAddress(contractAddress),
  {
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  },
);

const hash = await contract.write.settlePayment(
  [BigInt(runId), getAddress(recipientAddress), `AgentHub run ${runId}`],
  {
    value: BigInt(amountAtomic),
  },
);
const receipt = await publicClient.waitForTransactionReceipt({ hash });

console.log(
  JSON.stringify({
    contractAddress: getAddress(contractAddress),
    recipientAddress: getAddress(recipientAddress),
    amountAtomic,
    transactionHash: receipt.transactionHash,
  }),
);
