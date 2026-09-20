import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const MAINNET_KEY =
  process.env.DEPLOYER_PRIVATE_KEY_MAINNET ??
  process.env.DEPLOYER_PRIVATE_KEY ??
  "";
const TESTNET_KEY =
  process.env.DEPLOYER_PRIVATE_KEY_TESTNET ??
  process.env.DEPLOYER_PRIVATE_KEY ??
  "";

const ARC_MAINNET_RPC =
  process.env.ARC_MAINNET_RPC_URL ??
  process.env.ARC_RPC_URL ??
  "https://rpc.mainnet.arc.io";
const ARC_TESTNET_RPC =
  process.env.ARC_TESTNET_RPC_URL ?? "https://rpc.testnet.arc.io";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: false,
    },
  },
  networks: {
    hardhat: {},
    arcMainnet: {
      url: ARC_MAINNET_RPC,
      chainId: 5042,
      accounts: MAINNET_KEY ? [MAINNET_KEY] : [],
    },
    arcTestnet: {
      url: ARC_TESTNET_RPC,
      chainId: 5042002,
      accounts: TESTNET_KEY ? [TESTNET_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
