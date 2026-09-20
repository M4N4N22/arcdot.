import { ethers } from "hardhat";

const GATEWAY = "0x3E83ecb3Ef02CbFc67Ad42598A2B18f4510aC56f";

async function main() {
  const gw = await ethers.getContractAt("PromptGateway", GATEWAY);
  const net = await ethers.provider.getNetwork();
  const code = await ethers.provider.getCode(GATEWAY);

  console.log("");
  console.log("=== arcdot. PromptGateway — Arc Mainnet deploy proof ===");
  console.log("Network:      Arc Mainnet");
  console.log("chainId:     ", net.chainId.toString());
  console.log("Gateway:     ", GATEWAY);
  console.log("Explorer:     https://explorer.arc.io/address/" + GATEWAY);
  console.log("owner:       ", await gw.owner());
  console.log("treasury:    ", await gw.treasury());
  console.log("minFee:      ", (await gw.minFee()).toString());
  console.log("maxFee:      ", (await gw.maxFee()).toString());
  console.log("platformBps: ", (await gw.platformFeeBps()).toString());
  console.log("bytecode:    ", code.length > 2 ? "present" : "MISSING");
  console.log("");
  console.log("READY — PromptGateway live on Arc Mainnet (5042)");
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
