import { ethers } from "hardhat";

/** 0.01 USDC native floor */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10% platform fee */
const PLATFORM_FEE_BPS = 1000n;
const EXPLORER = "https://explorer.arc.io/address/";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Network chainId:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("minFee:", MIN_FEE.toString());
  console.log("platformFeeBps:", PLATFORM_FEE_BPS.toString());

  const gateway = await ethers.deployContract("PromptGateway", [
    MIN_FEE,
    PLATFORM_FEE_BPS,
  ]);
  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  console.log("\nPromptGateway V2 deployed to:", address);
  console.log("Explorer:", `${EXPLORER}${address}`);

  console.log("\n--- paste into next-app/.env.local ---\n");
  console.log(`PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log("GATEWAY_FEE_WEI=10000000000000000");
  console.log("NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI=10000000000000000");
  console.log("PLATFORM_FEE_BPS=1000");
  console.log("ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("NEXT_PUBLIC_ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("--------------------------------------\n");
  console.log("Redeploy required for V2 (seller split). Run schema_v2.sql in Supabase.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
