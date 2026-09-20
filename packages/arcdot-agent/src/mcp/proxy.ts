/**
 * Stdio MCP proxy: Cursor ↔ this process ↔ remote arcdot /api/mcp.
 * Auto-settles paid tools from ~/.arcdot/wallet (or ARCDOT_PRIVATE_KEY).
 * Local-only tool: arcdot_wallet (balance / fund hint — key never leaves this process).
 */

import { createInterface } from "node:readline";
import { callMcpToolWithAutoSettle, mcpRpc } from "../client/mcp.js";
import { formatFundsNeededMessage } from "../wallet/fundsNeeded.js";
import { formatNoWalletGuide } from "../wallet/guide.js";
import { getWalletStatus } from "../wallet/status.js";

type JsonRpcMsg = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
};

const LOCAL_WALLET_TOOL = {
  name: "arcdot_wallet",
  description:
    "Check whether the local agent wallet has enough USDC to pay. Call this when unlock fails for funds, or before spending. Returns a plain-language fund checklist (address, balance, Hub link). Never invent balances.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

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

async function handleWalletTool(
  id: string | number | null | undefined,
  origin: string,
) {
  try {
    const status = await getWalletStatus();
    // Use a tiny floor so the message shows “ready” vs fund path clearly.
    const requiredWei = 10_000_000_000_000_000n; // 0.01 USDC
    if (status.lowBalance || BigInt(status.balanceWei) < requiredWei) {
      const { text, payload } = formatFundsNeededMessage({
        status,
        requiredWei,
        origin,
      });
      ok(id, {
        content: [
          {
            type: "text",
            text: `${text}\n\n---\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
        isError: true,
      });
      return;
    }
    ok(id, {
      content: [
        {
          type: "text",
          text: [
            `Agent wallet ready: ${status.balanceUsdc} USDC available.`,
            `Address: ${status.address}`,
            `Network: ${status.network}`,
            "You can call arcdot_unlock — settlement will use this wallet automatically.",
            "",
            JSON.stringify(
              {
                ...status,
                action: "Wallet funded — unlocks can auto-settle.",
              },
              null,
              2,
            ),
          ].join("\n"),
        },
      ],
      isError: false,
    });
  } catch (err) {
    const detail =
      err instanceof Error ? err.message : "No local agent wallet found.";
    const { text, payload } = formatNoWalletGuide(origin, detail);
    ok(id, {
      content: [
        {
          type: "text",
          text: `${text}\n\n---\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      isError: true,
    });
  }
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
        if (remote.error) {
          fail(id, remote.error.code, remote.error.message);
          continue;
        }
        const result = remote.result as { tools?: unknown[] } | undefined;
        const tools = Array.isArray(result?.tools) ? [...result.tools] : [];
        const hasLocal = tools.some(
          (t) =>
            t &&
            typeof t === "object" &&
            "name" in t &&
            (t as { name: string }).name === LOCAL_WALLET_TOOL.name,
        );
        if (!hasLocal) tools.push(LOCAL_WALLET_TOOL);
        ok(id, { ...(result ?? {}), tools });
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
        if (p.name === LOCAL_WALLET_TOOL.name) {
          await handleWalletTool(id, base);
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
