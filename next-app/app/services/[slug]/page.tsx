"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import {
  useAccount,
  useSignMessage,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  buildGatewayAuthMessage,
  getAuthChallengeText,
} from "@/lib/agent/client";
import { makePaymentId } from "@/lib/agent/paymentId";
import { promptGatewayAbi } from "@/lib/arc/constants";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import { arcMainnet } from "@/lib/wallet/arcChain";

type PublicService = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_usdc: string;
  price_wei: string;
  owner_address: string;
};

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [service, setService] = useState<PublicService | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  const gateway = (process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS ||
    "") as `0x${string}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/services/${slug}`);
      if (!res.ok) {
        if (!cancelled) setLoadError("This service is not available.");
        return;
      }
      const data = (await res.json()) as { service: PublicService };
      if (!cancelled) setService(data.service);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const priceWei = useMemo(
    () => (service ? BigInt(service.price_wei) : BigInt(0)),
    [service],
  );

  const runPaidRequest = useCallback(async () => {
    if (!service || !address) return;
    if (!gateway || gateway.length !== 42) {
      setStatus(
        "Payment address is not configured yet. Deploy the gateway first.",
      );
      return;
    }
    if (!prompt.trim()) {
      setStatus("Write a short request first.");
      return;
    }

    setBusy(true);
    setReply(null);
    setTxHash(null);
    setStatus("Preparing checkout…");

    try {
      if (chainId !== ARC_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: ARC_CHAIN_ID });
        } catch {
          setStatus("Switch your wallet to Arc Mainnet to continue.");
          return;
        }
      }

      const paymentId = makePaymentId({
        payer: address,
        service: service.slug,
        nonce: Date.now(),
      });

      setStatus("Confirm the payment in your wallet…");
      const hash = await writeContractAsync({
        address: gateway,
        abi: promptGatewayAbi,
        functionName: "depositPayment",
        args: [paymentId],
        value: priceWei,
        chainId: ARC_CHAIN_ID,
      });
      setTxHash(hash);
      setStatus("Waiting for confirmation on Arc…");

      const client = createPublicClient({
        chain: arcMainnet,
        transport: http(
          process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.mainnet.arc.io",
        ),
      });
      await client.waitForTransactionReceipt({ hash });

      setStatus("Unlocking your request…");
      const now = Math.floor(Date.now() / 1000);
      const input = { prompt: prompt.trim() };
      const authMessage = buildGatewayAuthMessage({
        gateway,
        txHash: hash,
        feeWei: priceWei,
        service: service.slug,
        input,
        issuedAt: now,
        expiresAt: now + 120,
      });
      const challenge = getAuthChallengeText(authMessage);
      const signature = await signMessageAsync({ message: challenge });

      const res = await fetch("/api/gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Arc-Tx-Hash": hash,
          "X-Arc-Address": address,
          "X-Arc-Signature": signature,
        },
        body: JSON.stringify({
          service: service.slug,
          input,
          auth: { issuedAt: now, expiresAt: now + 120 },
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setStatus(
          body?.error?.message ||
            "Payment went through, but unlock failed. Check Activity or try again.",
        );
        return;
      }
      const text =
        body.result && typeof body.result.text === "string"
          ? body.result.text
          : JSON.stringify(body.result);
      setReply(text);
      setStatus("Done — your reply is ready.");
    } catch (err) {
      console.error(err);
      setStatus(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }, [
    address,
    chainId,
    gateway,
    priceWei,
    prompt,
    service,
    signMessageAsync,
    switchChainAsync,
    writeContractAsync,
  ]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-muted">{loadError}</p>
        <Link href="/services" className="mt-4 inline-block underline">
          Back to services
        </Link>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-muted">Loading…</main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <Link
        href="/services"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← All services
      </Link>

      <div className="mt-8 max-w-2xl animate-fade-up">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          {service.title}
        </h1>
        <p className="mt-3 text-muted">{service.description}</p>
        <p className="mt-4 font-mono text-sm">
          {service.price_usdc} USDC per request
        </p>
      </div>

      <div className="mt-12 max-w-2xl space-y-4">
        <label className="block text-sm font-medium" htmlFor="prompt">
          Your request
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
          placeholder="What should this service do for you?"
        />

        {!isConnected ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">Connect your wallet to pay.</p>
            <ConnectButton />
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void runPaidRequest()}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Working…" : `Pay ${service.price_usdc} USDC & unlock`}
          </button>
        )}

        {status && <p className="text-sm text-muted">{status}</p>}
        {txHash && (
          <p className="text-xs text-muted">
            <a
              className="underline"
              href={`https://explorer.arc.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View payment on explorer
            </a>
          </p>
        )}
        {reply && (
          <div className="border border-line bg-surface p-5 whitespace-pre-wrap text-sm leading-relaxed">
            {reply}
          </div>
        )}
      </div>
    </main>
  );
}
