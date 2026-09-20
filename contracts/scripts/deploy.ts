import { ethers } from "hardhat";

/** 0.01 USDC native floor (18 decimals) */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10_000 USDC fat-finger / griefing cap */
const MAX_FEE = 10_000n * 10n ** 18n;
/** 10% platform fee */
const PLATFORM_FEE_BPS = 1000n;

const NETWORK_META: Record<
  string,
  {
    label: string;
    explorerAddress: string;
    rpc: string;
    envSuffix: "MAINNET" | "TESTNET";
    networkFlag: "mainnet" | "testnet";
  }
> = {
  "5042": {
    label: "Arc Mainnet",
    explorerAddress: "https://explorer.arc.io/address/",
    rpc: "https://rpc.mainnet.arc.io",
    envSuffix: "MAINNET",
    networkFlag: "mainnet",
  },
  "5042002": {
    label: "Arc Testnet",
    explorerAddress: "https://testnet.arcscan.app/address/",
    rpc: "https://rpc.testnet.arc.io",
    envSuffix: "TESTNET",
    networkFlag: "testnet",
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainKey = network.chainId.toString();
  const meta = NETWORK_META[chainKey];
  if (!meta) {
    throw new Error(
      `Unknown chainId ${chainKey}. Use --network arcMainnet or arcTestnet.`,
    );
  }

  // Optional: PLATFORM_TREASURY=0x... — defaults to deployer.
  const treasury =
    process.env.PLATFORM_TREASURY?.trim() || deployer.address;

  console.log("Network:", meta.label);
  console.log("chainId:", chainKey);
  console.log("Deployer (owner):", deployer.address);
  console.log("Treasury:", treasury);
  console.log("minFee:", MIN_FEE.toString());
  console.log("maxFee:", MAX_FEE.toString());
  console.log("platformFeeBps:", PLATFORM_FEE_BPS.toString());

  const gateway = await ethers.deployContract("PromptGateway", [
    MIN_FEE,
    MAX_FEE,
    PLATFORM_FEE_BPS,
    treasury,
  ]);
  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  console.log("\nPromptGateway V3 deployed to:", address);
  console.log("Explorer:", `${meta.explorerAddress}${address}`);

  const gwVar = `PROMPT_GATEWAY_ADDRESS_${meta.envSuffix}`;
  const gwPublic = `NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_${meta.envSuffix}`;
  const rpcVar =
    meta.envSuffix === "TESTNET"
      ? "ARC_TESTNET_RPC_URL"
      : "ARC_MAINNET_RPC_URL";
  const rpcPublic =
    meta.envSuffix === "TESTNET"
      ? "NEXT_PUBLIC_ARC_TESTNET_RPC_URL"
      : "NEXT_PUBLIC_ARC_MAINNET_RPC_URL";

  console.log("\n--- paste into next-app/.env.local ---\n");
  console.log(`NEXT_PUBLIC_ARC_NETWORK=${meta.networkFlag}`);
  console.log(`ARC_NETWORK=${meta.networkFlag}`);
  console.log(`${gwVar}=${address}`);
  console.log(`${gwPublic}=${address}`);
  console.log("GATEWAY_FEE_WEI=10000000000000000");
  console.log("NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI=10000000000000000");
  console.log(`NEXT_PUBLIC_GATEWAY_MAX_FEE_WEI=${MAX_FEE.toString()}`);
  console.log("PLATFORM_FEE_BPS=1000");
  console.log(`PLATFORM_TREASURY=${treasury}`);
  console.log(`${rpcVar}=${meta.rpc}`);
  console.log(`${rpcPublic}=${meta.rpc}`);
  console.log("--------------------------------------\n");
  console.log(
    "V3 is immutable (treasury + maxFee locked). Redeploy to change policy.\n",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
