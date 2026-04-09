import { createRequire } from "node:module";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

const require = createRequire(import.meta.url);
const privateKey = process.env.PRIVATE_KEY?.trim();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: "0.8.28",
    path: require.resolve("solc/soljson.js"),
  },
  networks: {
    etherlink: {
      type: "http",
      chainType: "l1",
      url: "https://node.shadownet.etherlink.com",
      accounts: privateKey ? [privateKey] : [],
    },
  },
});
