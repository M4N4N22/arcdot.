import { NextResponse } from "next/server";
import { handleMcpMessage, parseJsonRpcBody } from "@/lib/mcp/handler";
import { MCP_PROTOCOL_VERSION, MCP_SERVER_INFO } from "@/lib/mcp/types";
import type { JsonRpcResponse } from "@/lib/mcp/types";

export const runtime = "nodejs";

/**
 * MCP Streamable HTTP endpoint (JSON responses).
 * POST JSON-RPC initialize / tools/list / tools/call.
 * GET returns server descriptor (no long-lived SSE on serverless).
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    protocol: "mcp",
    transport: "streamable-http",
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: MCP_SERVER_INFO,
    endpoint: `${origin}/api/mcp`,
    methods: ["initialize", "tools/list", "tools/call", "ping"],
    payment: {
      note: "Paid tools settle on Arc via PromptGateway. Unpaid tools/call returns 402-shaped JSON. The buyer agent wallet lives in the client runtime — arcdot. never holds user keys. See /fund.",
      clientPayment: [
        "Create agent wallet locally",
        "Fund with native USDC on Arc",
        "depositPayment + EIP-191 in your agent",
        "Retry tools/call with arguments.payment",
      ],
    },
    docs: `${origin}/hub`,
    reference: `${origin}/docs/mcp`,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      },
      { status: 400 },
    );
  }

  const parsed = parseJsonRpcBody(body);
  if (!parsed) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32600, message: "Invalid Request" },
      },
      { status: 400 },
    );
  }

  if (Array.isArray(parsed)) {
    const results: JsonRpcResponse[] = [];
    for (const msg of parsed) {
      const res = await handleMcpMessage(request, msg);
      if (res) results.push(res);
    }
    return NextResponse.json(results, {
      headers: {
        "Content-Type": "application/json",
        "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
      },
    });
  }

  const result = await handleMcpMessage(request, parsed);
  if (!result) {
    // notification — empty success
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json",
      "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type, Accept, MCP-Protocol-Version, X-Arc-Demo-Secret",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}
