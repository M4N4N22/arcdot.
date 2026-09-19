import { z } from "zod";

const hexAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "invalid address");
const hexTx = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "invalid tx hash");
const hexSig = z.string().regex(/^0x[a-fA-F0-9]+$/, "invalid signature");

export const gatewayBodySchema = z.object({
  service: z.string().min(1).max(64),
  input: z.unknown(),
  clientRequestId: z.string().max(128).optional(),
  /** Client-built auth fields mirrored into the signed challenge */
  auth: z.object({
    issuedAt: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
  }),
});

export const gatewayHeadersSchema = z.object({
  txHash: hexTx,
  address: hexAddress,
  signature: hexSig,
});

export type GatewayBody = z.infer<typeof gatewayBodySchema>;
