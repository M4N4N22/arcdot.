import { callMcpTool, listMcpTools } from "@/lib/mcp/tools";
import {
  jsonRpcError,
  jsonRpcResult,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_INFO,
  type JsonRpcId,
  type JsonRpcRequest,
  type JsonRpcResponse,
} from "@/lib/mcp/types";

function isNotification(msg: JsonRpcRequest): boolean {
  return msg.id === undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export async function handleMcpMessage(
  request: Request,
  msg: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  const id: JsonRpcId = msg.id ?? null;

  // Notifications — no response body required
  if (isNotification(msg)) {
    if (
      msg.method === "notifications/initialized" ||
      msg.method === "notifications/cancelled"
    ) {
      return null;
    }
    return null;
  }

  switch (msg.method) {
    case "initialize": {
      return jsonRpcResult(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: MCP_SERVER_INFO,
        instructions:
          "arcdot. is an Arc USDC toll booth. Use arcdot_catalog, then call arcdot_<slug> tools. Unpaid calls return payment instructions (price_wei is 18-decimal native USDC). Pass payment {txHash,address,signature} after depositPayment, or set X-Arc-Demo-Secret for rehearsal.",
      });
    }

    case "ping":
      return jsonRpcResult(id, {});

    case "tools/list": {
      const tools = await listMcpTools();
      return jsonRpcResult(id, { tools });
    }

    case "tools/call": {
      const params = asRecord(msg.params);
      const name = typeof params.name === "string" ? params.name : "";
      if (!name) {
        return jsonRpcError(id, -32602, "tools/call requires params.name");
      }
      const args = asRecord(params.arguments);
      try {
        const result = await callMcpTool({ request, name, args });
        return jsonRpcResult(id, result);
      } catch (err) {
        return jsonRpcError(
          id,
          -32000,
          err instanceof Error ? err.message : "Tool call failed",
        );
      }
    }

    case "resources/list":
      return jsonRpcResult(id, { resources: [] });

    case "prompts/list":
      return jsonRpcResult(id, { prompts: [] });

    default:
      return jsonRpcError(id, -32601, `Method not found: ${msg.method}`);
  }
}

export function parseJsonRpcBody(body: unknown): JsonRpcRequest | JsonRpcRequest[] | null {
  if (Array.isArray(body)) {
    if (body.every((m) => m && typeof m === "object" && "method" in m)) {
      return body as JsonRpcRequest[];
    }
    return null;
  }
  if (body && typeof body === "object" && "method" in body) {
    return body as JsonRpcRequest;
  }
  return null;
}
