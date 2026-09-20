/** Shared first-run / fund guidance for MCP hosts (Cursor, etc.). */

export const WALLET_CREATE_CMD = "npx --yes @arcdot/agent wallet create";
export const WALLET_STATUS_CMD = "npx --yes @arcdot/agent wallet status";

export function fundUrlFor(origin: string, address?: string): string {
  const base = origin.replace(/\/$/, "");
  if (address) {
    return `${base}/fund?address=${encodeURIComponent(address)}`;
  }
  return `${base}/fund`;
}

/**
 * Host-agent directives so Cursor can show its command-approval UI.
 * MCP cannot open that UI itself — the chat agent must run the shell tool.
 */
export function hostAgentShellDirective(command: string): string {
  return [
    "HOST AGENT (Cursor / IDE) — do this next for smooth UX:",
    `→ Immediately propose running this shell command (so the user gets the normal pending-approval UI):`,
    `     ${command}`,
    "→ After it succeeds, open/show the fundUrl link and ask them to send ~0.05 USDC.",
    "→ Then retry arcdot_unlock with the same service + prompt.",
    "→ Do NOT invent an answer. Do NOT only paste the command as plain text if you can run the terminal tool.",
  ].join("\n");
}

export function formatNoWalletGuide(origin: string, detail?: string): {
  text: string;
  payload: Record<string, unknown>;
} {
  const fundUrl = fundUrlFor(origin);
  const text = [
    "Setup needed: no agent wallet on this machine yet — unlocks cannot settle.",
    "",
    "For you (human):",
    `1. Approve the wallet-create command when your IDE asks (or run: ${WALLET_CREATE_CMD}).`,
    `2. Open ${fundUrl} and send about 0.05 USDC to the printed address.`,
    "3. We’ll retry the unlock automatically after that — don’t invent an answer.",
    "",
    hostAgentShellDirective(WALLET_CREATE_CMD),
    "",
    detail ? `Detail: ${detail}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    error: "NO_WALLET",
    message: detail ?? "No local agent wallet found.",
    fundUrl,
    createCommand: WALLET_CREATE_CMD,
    statusCommand: WALLET_STATUS_CMD,
    hostAgent: {
      action: "run_shell_with_user_approval",
      command: WALLET_CREATE_CMD,
      then: ["open_fundUrl", "retry_arcdot_unlock"],
    },
    next: `Run ${WALLET_CREATE_CMD} (with user approval), open ${fundUrl}, then retry arcdot_unlock.`,
  };

  return { text, payload };
}
