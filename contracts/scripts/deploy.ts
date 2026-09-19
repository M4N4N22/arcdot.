import { ethers } from "hardhat";

/** 0.01 USDC in Arc native 18-decimal units */
const FEE_AMOUNT = 10_000_000_000_000_000n;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Fee (wei):", FEE_AMOUNT.toString());

  const gateway = await ethers.deployContract("PromptGateway", [FEE_AMOUNT]);
  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  console.log("PromptGateway deployed to:", address);
  console.log("feeAmount:", (await gateway.feeAmount()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
