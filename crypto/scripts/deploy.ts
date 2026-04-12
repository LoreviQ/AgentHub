import { network } from "hardhat";

const { viem } = await network.connect({
  network: "etherlink",
});

console.log("Deploying DemoAgentPayments to etherlink");

const { contract, deploymentTransaction } =
  await viem.sendDeploymentTransaction("DemoAgentPayments", []);
const publicClient = await viem.getPublicClient();
const receipt = await publicClient.waitForTransactionReceipt({
  hash: deploymentTransaction.hash,
});

console.log(
  JSON.stringify({
    contractName: "DemoAgentPayments",
    address: contract.address,
    transactionHash: receipt.transactionHash,
  }),
);
