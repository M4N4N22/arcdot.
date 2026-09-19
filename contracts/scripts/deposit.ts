import { ethers } from "hardhat";

/**
 * Smoke deposit (V2): GATEWAY_ADDRESS=0x... SELLER=0x... npx hardhat run scripts/deposit.ts --network arcMainnet
 */

const FEE_AMOUNT = 10_000_000_000_000_000n;
const EXPLORER_TX = "https://explorer.arc.io/tx/";

async function main() {
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  const seller = process.env.SELLER;
  if (!gatewayAddress?.startsWith("0x")) {
    throw new Error("Set GATEWAY_ADDRESS");
  }
  if (!seller?.startsWith("0x")) {
    throw new Error("Set SELLER to the service owner address");
  }

  const [payer] = await ethers.getSigners();
  const gateway = await ethers.getContractAt("PromptGateway", gatewayAddress);
  const fee = await gateway.minFee();

  const nonce = BigInt(Date.now());
  const paymentId = ethers.solidityPackedKeccak256(
    ["address", "string", "uint256"],
    [payer.address, "llm.chat", nonce],
  );

  console.log("Payer:", payer.address);
  console.log("Seller:", seller);
  console.log("paymentId:", paymentId);

  const tx = await gateway.depositPayment(paymentId, seller, { value: fee });
  console.log("Submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Block:", receipt?.blockNumber);
  console.log("Explorer:", `${EXPLORER_TX}${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
