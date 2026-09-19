import { ethers } from "hardhat";

/**
 * Smoke deposit against a deployed PromptGateway.
 *
 *   GATEWAY_ADDRESS=0x... npx hardhat run scripts/deposit.ts --network arcMainnet
 */

const FEE_AMOUNT = 10_000_000_000_000_000n;
const EXPLORER_TX = "https://explorer.arc.io/tx/";

async function main() {
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  if (!gatewayAddress || !gatewayAddress.startsWith("0x")) {
    throw new Error("Set GATEWAY_ADDRESS to the deployed PromptGateway");
  }

  const [payer] = await ethers.getSigners();
  const gateway = await ethers.getContractAt("PromptGateway", gatewayAddress);

  const fee = await gateway.minFee();
  if (fee !== FEE_AMOUNT) {
    console.warn("Warning: on-chain minFee differs from expected 1e16:", fee.toString());
  }

  const nonce = BigInt(Date.now());
  const paymentId = ethers.solidityPackedKeccak256(
    ["address", "string", "uint256"],
    [payer.address, "llm.chat", nonce],
  );

  console.log("Payer:", payer.address);
  console.log("Gateway:", gatewayAddress);
  console.log("paymentId:", paymentId);
  console.log("value:", fee.toString());

  const tx = await gateway.depositPayment(paymentId, { value: fee });
  console.log("Submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt?.blockNumber);
  console.log("Explorer:", `${EXPLORER_TX}${tx.hash}`);
  console.log("\nUse this tx hash as X-Arc-Tx-Hash when calling /api/gateway.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
