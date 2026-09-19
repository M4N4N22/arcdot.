import { encodeAbiParameters, keccak256, type Hex } from "viem";

export function makePaymentId(params: {
  payer: `0x${string}`;
  service: string;
  nonce: string | number | bigint;
}): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "string" },
        { type: "uint256" },
      ],
      [params.payer, params.service, BigInt(params.nonce)],
    ),
  );
}
