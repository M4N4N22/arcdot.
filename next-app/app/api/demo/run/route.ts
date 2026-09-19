import { callGatewayDemo } from "@/lib/agent/client";
import type { Gateway200Body } from "@/lib/types/gateway";

export const runtime = "nodejs";

export type DemoLogLevel = "info" | "warn" | "ok" | "pay" | "fail";

export type DemoSseEvent =
  | { type: "log"; level: DemoLogLevel; text: string; ts?: string }
  | { type: "answer"; text: string; mock: boolean }
  | { type: "done" }
  | { type: "error"; text: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function stamp(): string {
  return new Date().toISOString().slice(11, 19);
}

function encodeSse(event: DemoSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function shortHash(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `0x${hex}…`;
}

/**
 * Sandbox terminal narrative + demo unlock via server DEMO_AGENT_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.DEMO_AGENT_SECRET;
  if (!secret) {
    return Response.json(
      {
        error:
          "Demo unlock is not configured. Set DEMO_AGENT_SECRET in .env.local.",
      },
      { status: 503 },
    );
  }

  let prompt =
    "In two short sentences, explain why tiny USDC payments help AI agents buy API access.";
  let service = "quick-brief";
  try {
    const body = (await request.json()) as {
      prompt?: string;
      service?: string;
    };
    if (typeof body.prompt === "string" && body.prompt.trim()) {
      prompt = body.prompt.trim();
    }
    if (
      typeof body.service === "string" &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.service)
    ) {
      service = body.service;
    }
  } catch {
    // defaults
  }

  const baseUrl = new URL(request.url).origin;
  const encoder = new TextEncoder();
  const walletHint = "0x8f2a…c4e1";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: DemoSseEvent) => {
        if (event.type === "log" && !event.ts) {
          event = { ...event, ts: stamp() };
        }
        controller.enqueue(encoder.encode(encodeSse(event)));
      };

      try {
        send({
          type: "log",
          level: "info",
          text: `Agent [${walletHint}] initiated task against service "${service}"`,
        });
        await sleep(400);

        send({
          type: "log",
          level: "info",
          text: `Querying gated unlock: POST /api/gateway (service=${service})`,
        });
        await sleep(500);

        send({
          type: "log",
          level: "warn",
          text: "Gateway response: payment required — unlock blocked until settlement",
        });
        await sleep(600);

        send({
          type: "log",
          level: "info",
          text: "Agent wallet reading native USDC balance on Arc Mainnet…",
        });
        await sleep(500);

        send({
          type: "log",
          level: "pay",
          text: "Nanopayment: transferring service price in USDC to checkout contract",
        });
        await sleep(800);

        const fakeTx = shortHash();
        send({
          type: "log",
          level: "ok",
          text: `Arc confirmation received. Payment id ${fakeTx} (demo path — real agents use on-chain deposit)`,
        });
        await sleep(450);

        send({
          type: "log",
          level: "info",
          text: "Re-submitting with wallet proof + payment confirmation…",
        });
        await sleep(400);

        send({
          type: "log",
          level: "ok",
          text: "Settlement verified. Forwarding request to the service model…",
        });
        await sleep(350);

        const result = await callGatewayDemo({
          baseUrl,
          service,
          input: { prompt },
          demoSecret: secret,
          clientRequestId: `demo-${Date.now()}`,
        });

        if (!result.ok) {
          send({
            type: "error",
            text: "Unlock failed after simulated settlement. Check service slug and demo config.",
          });
          send({ type: "done" });
          controller.close();
          return;
        }

        const body = result.body as Gateway200Body;
        const text =
          body.result &&
          typeof body.result === "object" &&
          body.result !== null &&
          "text" in body.result &&
          typeof (body.result as { text: unknown }).text === "string"
            ? (body.result as { text: string }).text
            : JSON.stringify(body.result);

        send({
          type: "answer",
          text,
          mock: Boolean(body.meta?.mock),
        });

        send({
          type: "log",
          level: "ok",
          text: "Success: response delivered to agent. Task complete.",
        });
        send({ type: "done" });
      } catch (err) {
        console.error(err);
        send({
          type: "error",
          text: "Sandbox run failed. Retry in a moment.",
        });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
