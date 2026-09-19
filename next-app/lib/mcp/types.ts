/**
 * Thin MCP (Model Context Protocol) adapter for arcdot.
 * Streamable HTTP JSON-RPC — not a second marketplace.
 */

export const MCP_PROTOCOL_VERSION = "2025-03-26";
export const MCP_SERVER_INFO = {
  name: "arcdot",
  version: "0.1.0",
} as const;

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export type McpContent =
  | { type: "text"; text: string }
  | { type: "resource"; resource: { uri: string; text?: string; mimeType?: string } };

export type McpToolResult = {
  content: McpContent[];
  isError?: boolean;
  _meta?: Record<string, unknown>;
};

export function jsonRpcResult(
  id: JsonRpcId,
  result: unknown,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function jsonRpcError(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: data !== undefined ? { code, message, data } : { code, message },
  };
}

/** MCP tool name from service slug (a-z0-9_). */
export function toolNameForSlug(slug: string): string {
  const safe = slug.replace(/-/g, "_").replace(/[^a-z0-9_]/gi, "");
  return `arcdot_${safe}`.slice(0, 64);
}

export function slugFromToolName(name: string): string | null {
  if (!name.startsWith("arcdot_")) return null;
  if (name === "arcdot_catalog" || name === "arcdot_health") return null;
  return name.slice("arcdot_".length).replace(/_/g, "-");
}
