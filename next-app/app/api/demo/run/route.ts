import { callGatewayDemo } from "@/lib/agent/client";
import type { Gateway200Body } from "@/lib/types/gateway";

export const runtime = "nodejs";

export type DemoLogLevel = "info" | "warn" | "ok" | "pay";

export type DemoSseEvent =
  | { type: "log"; level: DemoLogLevel; text: string }
  | { type: "answer"; text: string; mock: boolean }
  | { type: "done" }
  | { type: "error"; text: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function encodeSse(event: DemoSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Orchestrates the Activity console narrative and calls /api/gateway
 * with the server-side DEMO_AGENT_SECRET (never sent to the browser).
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
  try {
    const body = (await request.json()) as { prompt?: string };
    if (typeof body.prompt === "string" && body.prompt.trim()) {
      prompt = body.prompt.trim();
    }
  } catch {
    // default prompt
  }

  const baseUrl = new URL(request.url).origin;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: DemoSseEvent) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      };

      try {
        send({
          type: "log",
          level: "info",
          text: "Agent online — preparing a paid request…",
        });
        await sleep(450);

        send({
          type: "log",
          level: "warn",
          text: "Access locked — a small payment is required to continue.",
        });
        await sleep(700);

        send({
          type: "log",
          level: "pay",
          text: "Sending 0.01 USDC checkout on Arc…",
        });
        await sleep(900);

        send({
          type: "log",
          level: "ok",
          text: "Payment confirmed. Unlocking the endpoint…",
        });
        await sleep(400);

        send({
          type: "log",
          level: "info",
          text: "Streaming reply from the model…",
        });

        const result = await callGatewayDemo({
          baseUrl,
          service: "quick-brief",
          input: { prompt },
          demoSecret: secret,
          clientRequestId: `demo-${Date.now()}`,
        });

        if (!result.ok) {
          send({
            type: "error",
            text: "Could not unlock the endpoint right now. Try again in a moment.",
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
          text: "Done. Agent received a live answer and is moving on.",
        });
        send({ type: "done" });
      } catch (err) {
        console.error(err);
        send({
          type: "error",
          text: "Something went wrong during the run. Please replay in a moment.",
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
