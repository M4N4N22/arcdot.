import { ethers } from "hardhat";

/** 0.01 USDC native floor (18 decimals) */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10_000 USDC fat-finger / griefing cap */
const MAX_FEE = 10_000n * 10n ** 18n;
/** 10% platform fee */
const PLATFORM_FEE_BPS = 1000n;
const EXPLORER = "https://explorer.arc.io/address/";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  // Optional: PLATFORM_TREASURY=0x... — defaults to deployer.
  const treasury =
    process.env.PLATFORM_TREASURY?.trim() || deployer.address;

  console.log("Network chainId:", network.chainId.toString());
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
  console.log("Explorer:", `${EXPLORER}${address}`);

  console.log("\n--- paste into next-app/.env.local ---\n");
  console.log(`PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log("GATEWAY_FEE_WEI=10000000000000000");
  console.log("NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI=10000000000000000");
  console.log(`NEXT_PUBLIC_GATEWAY_MAX_FEE_WEI=${MAX_FEE.toString()}`);
  console.log("PLATFORM_FEE_BPS=1000");
  console.log(`PLATFORM_TREASURY=${treasury}`);
  console.log("ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("NEXT_PUBLIC_ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("--------------------------------------\n");
  console.log(
    "V3 is immutable (treasury + maxFee locked). Redeploy to change policy.\n",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
