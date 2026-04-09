import { network } from "hardhat";

const message = process.env.DUMMY_MESSAGE ?? "Hello from Dummy";

const { viem } = await network.connect({
  network: "etherlink",
});

console.log(`Deploying Dummy to etherlink with message: "${message}"`);

const { contract: dummy, deploymentTransaction } =
  await viem.sendDeploymentTransaction("Dummy", [message]);
const publicClient = await viem.getPublicClient();
const receipt = await publicClient.waitForTransactionReceipt({
  hash: deploymentTransaction.hash,
});

console.log("Dummy deployed successfully");
console.log("Address:", dummy.address);
console.log("Transaction:", receipt.transactionHash);
