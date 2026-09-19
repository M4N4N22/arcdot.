/**
 * Stdio MCP proxy: Cursor ↔ this process ↔ remote arcdot /api/mcp.
 * Auto-settles paid tools from ~/.arcdot/wallet (or ARCDOT_PRIVATE_KEY).
 */

import { createInterface } from "node:readline";
import { callMcpToolWithAutoSettle, mcpRpc } from "../client/mcp.js";

type JsonRpcMsg = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
};

function write(msg: object) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function ok(id: string | number | null | undefined, result: unknown) {
  write({ jsonrpc: "2.0", id: id ?? null, result });
}

function fail(
  id: string | number | null | undefined,
  code: number,
  message: string,
) {
  write({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  });
}

export async function runMcpProxy(origin: string) {
  const base = origin.replace(/\/$/, "");
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

  // Log to stderr only — stdout is MCP JSON-RPC
  console.error(`[arcdot] MCP proxy → ${base}/api/mcp`);

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let msg: JsonRpcMsg;
    try {
      msg = JSON.parse(trimmed) as JsonRpcMsg;
    } catch {
      fail(null, -32700, "Parse error");
      continue;
    }

    const id = msg.id;
    const method = msg.method;

    // Notifications (no id) — acknowledge silently for initialized
    if (method === "notifications/initialized" || id === undefined) {
      if (method && method.startsWith("notifications/")) continue;
    }

    try {
      if (method === "initialize") {
        const remote = await mcpRpc(base, "initialize", msg.params);
        if (remote.error) {
          fail(id, remote.error.code, remote.error.message);
        } else {
          // Ensure we advertise as a proxy client-compatible server
          const result = remote.result as Record<string, unknown> | undefined;
          ok(id, result ?? {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "arcdot-proxy", version: "0.1.0" },
          });
        }
        continue;
      }

      if (method === "ping") {
        ok(id, {});
        continue;
      }

      if (method === "tools/list") {
        const remote = await mcpRpc(base, "tools/list", msg.params);
        if (remote.error) fail(id, remote.error.code, remote.error.message);
        else ok(id, remote.result);
        continue;
      }

      if (method === "tools/call") {
        const p = msg.params as {
          name?: string;
          arguments?: Record<string, unknown>;
        };
        if (!p?.name) {
          fail(id, -32602, "tools/call requires params.name");
          continue;
        }
        const remote = await callMcpToolWithAutoSettle({
          origin: base,
          name: p.name,
          arguments: p.arguments,
        });
        if (remote.error) fail(id, remote.error.code, remote.error.message);
        else ok(id, remote.result);
        continue;
      }

      // Forward other methods if any
      if (method) {
        const remote = await mcpRpc(base, method, msg.params);
        if (remote.error) fail(id, remote.error.code, remote.error.message);
        else ok(id, remote.result);
        continue;
      }

      fail(id, -32600, "Invalid Request");
    } catch (err) {
      fail(
        id,
        -32000,
        err instanceof Error ? err.message : "Proxy error",
      );
    }
  }
}
