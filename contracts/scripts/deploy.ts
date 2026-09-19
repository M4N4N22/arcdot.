import { ethers } from "hardhat";

/** 0.01 USDC in Arc native 18-decimal units — platform minimum fee */
const MIN_FEE = 10_000_000_000_000_000n;
const EXPLORER = "https://explorer.arc.io/address/";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Network chainId:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("minFee (wei):", MIN_FEE.toString(), "(0.01 USDC native floor)");

  const gateway = await ethers.deployContract("PromptGateway", [MIN_FEE]);
  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  console.log("\nPromptGateway deployed to:", address);
  console.log("Explorer:", `${EXPLORER}${address}`);
  console.log("minFee:", (await gateway.minFee()).toString());

  console.log("\n--- paste into next-app/.env.local ---\n");
  console.log(`PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS=${address}`);
  console.log("GATEWAY_FEE_WEI=10000000000000000");
  console.log("NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI=10000000000000000");
  console.log("ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("NEXT_PUBLIC_ARC_RPC_URL=https://rpc.mainnet.arc.io");
  console.log("--------------------------------------\n");
  console.log("Note: Redeploy required after minFee upgrade. Catalog prices are enforced by the API.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
