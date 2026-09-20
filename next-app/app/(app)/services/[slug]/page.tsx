"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
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
import { BrandMark } from "@/components/explore/BrandMark";
import {
  buildGatewayAuthMessage,
  getAuthChallengeText,
} from "@/lib/agent/client";
import { makePaymentId } from "@/lib/agent/paymentId";
import { ARC, promptGatewayAbi } from "@/lib/arc/constants";
import { getToolMeta, resolveToolImage } from "@/lib/explore/toolMeta";
import { getActiveArcChain } from "@/lib/wallet/arcChain";

type UnlockStep = "idle" | "pay" | "confirm" | "unlock" | "done" | "error";

type PublicService = {
  slug: string;
  title: string;
  description: string;
  price_usdc: string;
  price_wei: string;
  seller?: string;
  owner_address?: string;
  seller_name?: string | null;
  image_url?: string | null;
};

const STEPS: { id: UnlockStep; label: string }[] = [
  { id: "pay", label: "Pay" },
  { id: "confirm", label: "Confirm" },
  { id: "unlock", label: "Unlock" },
  { id: "done", label: "Reply" },
];

function stepIndex(step: UnlockStep): number {
  if (step === "idle" || step === "error") return -1;
  return STEPS.findIndex((s) => s.id === step);
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [service, setService] = useState<PublicService | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [step, setStep] = useState<UnlockStep>("idle");
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  const gateway = (ARC.gatewayAddress || "") as `0x${string}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/services/${slug}`);
      if (!res.ok) {
        if (!cancelled) setLoadError("This tool is not available.");
        return;
      }
      const data = (await res.json()) as { service: PublicService };
      if (!cancelled) setService(data.service);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!service) return;
    if (typeof window === "undefined") return;
    if (window.location.hash === "#try") {
      document.getElementById("try")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [service]);

  const priceWei = useMemo(
    () => (service ? BigInt(service.price_wei) : BigInt(0)),
    [service],
  );

  const sellerAddress = service?.seller || service?.owner_address || "";

  const runPaidRequest = useCallback(async () => {
    if (!service || !address || !sellerAddress) return;
    if (!gateway || gateway.length !== 42) {
      setStep("error");
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
    setStep("pay");
    setStatus("Confirm the payment in your wallet…");

    try {
      if (chainId !== ARC.chainId) {
        try {
          await switchChainAsync({ chainId: ARC.chainId });
        } catch {
          setStep("error");
          setStatus(
            ARC.network === "testnet"
              ? "Switch your wallet to Arc Testnet to continue."
              : "Switch your wallet to Arc Mainnet to continue.",
          );
          return;
        }
      }

      const paymentId = makePaymentId({
        payer: address,
        service: service.slug,
        nonce: Date.now(),
      });

      const hash = await writeContractAsync({
        address: gateway,
        abi: promptGatewayAbi,
        functionName: "depositPayment",
        args: [paymentId, sellerAddress as `0x${string}`],
        value: priceWei,
        chainId: ARC.chainId,
      });
      setTxHash(hash);
      setStep("confirm");
      setStatus("Waiting for confirmation on Arc…");

      const client = createPublicClient({
        chain: getActiveArcChain(),
        transport: http(ARC.rpcUrl),
      });
      await client.waitForTransactionReceipt({ hash });

      setStep("unlock");
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
        setStep("error");
        setStatus(
          body?.error?.message ||
            "Payment went through, but unlock failed. Try again in a moment.",
        );
        return;
      }
      const text =
        body.result && typeof body.result.text === "string"
          ? body.result.text
          : JSON.stringify(body.result);
      setReply(text);
      setStep("done");
      setStatus("Done — your reply is ready.");
    } catch (err) {
      console.error(err);
      setStep("error");
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
    sellerAddress,
    service,
    signMessageAsync,
    switchChainAsync,
    writeContractAsync,
  ]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <p className="text-muted">{loadError}</p>
        <Link href="/services" className="mt-4 inline-block underline">
          Back to Explore
        </Link>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-muted md:px-8">
        Loading…
      </main>
    );
  }

  const activeIdx = stepIndex(step);
  const meta = getToolMeta(service.slug, service.description);
  const image = resolveToolImage({
    imageUrl: service.image_url,
    slug: service.slug,
  });
  const ownerLabel = service.seller_name || shortAddr(sellerAddress);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <Link
        href="/services"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Explore
      </Link>

      <header className="mt-6 flex max-w-2xl animate-fade-up flex-col gap-5 sm:flex-row sm:items-start">
        {image ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-line bg-background">
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          </div>
        ) : (
          <BrandMark size="lg" />
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {meta.category}
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">
            {service.title}
          </h1>
          {meta.tagline && <p className="mt-2 text-muted">{meta.tagline}</p>}
          <p className="mt-4 font-mono text-sm">
            {service.price_usdc} USDC per request
          </p>
          <p className="mt-2 font-mono text-xs text-muted">{service.slug}</p>
          {sellerAddress && (
            <p className="mt-3 text-sm text-muted">
              Owned by{" "}
              <Link
                href={`/u/${sellerAddress}`}
                className="text-foreground underline underline-offset-4"
              >
                {ownerLabel}
              </Link>
            </p>
          )}
          <a
            href="#try"
            className="mt-5 inline-flex h-10 items-center bg-accent px-4 text-sm font-medium text-surface"
          >
            Try in browser
          </a>
        </div>
      </header>

      <section className="mt-12 max-w-2xl border-t border-line pt-10">
        <h2 className="font-display text-2xl tracking-tight">About</h2>
        <p className="mt-3 leading-relaxed text-muted">{service.description}</p>

        <h3 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted">
          Use cases
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted marker:text-foreground/40">
          {meta.useCases.map((uc) => (
            <li key={uc}>{uc}</li>
          ))}
        </ul>
      </section>

      <section
        id="try"
        className="mt-12 max-w-2xl scroll-mt-24 border-t border-line pt-10"
      >
        <h2 className="font-display text-2xl tracking-tight">
          Try in browser
        </h2>
        <p className="mt-2 text-muted">
          Pay a few cents in USDC, unlock a reply — same path agents use.
        </p>

        <ol className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted">
          {STEPS.map((s, i) => {
            const reached = activeIdx >= i;
            const current = activeIdx === i && step !== "done";
            return (
              <li
                key={s.id}
                className={[
                  "border border-line px-3 py-1.5",
                  reached ? "text-foreground" : "",
                  current ? "bg-foreground/[0.06]" : "bg-surface/60",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")} {s.label}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 space-y-4">
          <label className="block text-sm font-medium" htmlFor="prompt">
            Your request
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
            placeholder="What should this tool do for you?"
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
                href={`${ARC.explorerTxBase}${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View payment confirmation
              </a>
            </p>
          )}
          {reply && (
            <div className="border border-line bg-surface p-5 whitespace-pre-wrap text-sm leading-relaxed">
              {reply}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 max-w-2xl border-t border-line pt-8">
        <p className="text-sm text-muted">
          Building an agent? Connect via the{" "}
          <Link href="/hub" className="underline underline-offset-4">
            MCP Hub
          </Link>{" "}
          or discover tools at{" "}
          <span className="font-mono text-foreground">GET /api/services</span>.
        </p>
      </section>
    </main>
  );
}
