/** Shared first-run / fund guidance for MCP hosts (Cursor, etc.). */

export const WALLET_CREATE_CMD = "npx --yes @arcdot/agent wallet create";
export const WALLET_IMPORT_CMD =
  "npx --yes @arcdot/agent wallet import --key 0xYOUR_PRIVATE_KEY";
export const WALLET_IMPORT_FROM_ENV_CMD =
  "npx --yes @arcdot/agent wallet import --from-env";
export const WALLET_STATUS_CMD = "npx --yes @arcdot/agent wallet status";

export function fundUrlFor(origin: string, address?: string): string {
  const base = origin.replace(/\/$/, "");
  if (address) {
    return `${base}/fund?address=${encodeURIComponent(address)}`;
  }
  return `${base}/fund`;
}

/**
 * After the human picks "create", propose this shell for IDE approval UI.
 */
export function hostAgentCreateShellDirective(): string {
  return [
    "HOST AGENT — only after the human picks A (create):",
    `→ Propose this shell command for approval:`,
    `     ${WALLET_CREATE_CMD}`,
    "→ After it succeeds, open/show the fundUrl and ask them to send ~0.05 USDC on Arc.",
    "→ Then retry arcdot_unlock with the same service + prompt.",
  ].join("\n");
}

export function formatNoWalletGuide(origin: string, detail?: string): {
  text: string;
  payload: Record<string, unknown>;
} {
  const fundUrl = fundUrlFor(origin);
  const text = [
    "STOP — no agent wallet on this machine. Unlocks cannot settle yet.",
    "",
    "Ask the human which path they want BEFORE running any shell command.",
    "Do NOT auto-run wallet create. Do NOT invent an answer.",
    "Do NOT ask them to paste a private key into chat.",
    "",
    "A) New wallet — I will run create with your approval, then you fund on Arc",
    `   Command (only after they say A / new / create): ${WALLET_CREATE_CMD}`,
    `   Then open ${fundUrl} (~0.05 USDC on Arc) and retry unlock.`,
    "",
    "B) I already have a wallet / key — I will import it myself",
    "   Tell them to run ONE of these in their own terminal (not in chat):",
    `   • ${WALLET_IMPORT_CMD}`,
    `   • or set ARCDOT_PRIVATE_KEY in MCP env, then: ${WALLET_IMPORT_FROM_ENV_CMD}`,
    "   • or restore a backed-up ~/.arcdot/wallet.json onto this machine",
    `   Then: ${WALLET_STATUS_CMD} → if low, open ${fundUrl} → say “retry” so we unlock again.`,
    "",
    hostAgentCreateShellDirective(),
    "",
    detail ? `Detail: ${detail}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    error: "NO_WALLET",
    message: detail ?? "No local agent wallet found.",
    fundUrl,
    /** @deprecated Prefer options.create.command — kept for older hosts */
    createCommand: WALLET_CREATE_CMD,
    importCommand: WALLET_IMPORT_CMD,
    importFromEnvCommand: WALLET_IMPORT_FROM_ENV_CMD,
    statusCommand: WALLET_STATUS_CMD,
    requireHumanChoice: true,
    askHumanFirst:
      "Present options A (create) and B (import). Wait for their reply before any shell.",
    options: {
      create: {
        id: "A",
        label: "Create a new agent wallet",
        command: WALLET_CREATE_CMD,
        then: ["open_fundUrl", "retry_arcdot_unlock"],
      },
      import: {
        id: "B",
        label: "Import / restore a wallet I already own",
        command: WALLET_IMPORT_CMD,
        fromEnvCommand: WALLET_IMPORT_FROM_ENV_CMD,
        note: "Human runs import locally. Never paste the private key into chat or arcdot. websites.",
        then: ["wallet_status", "open_fundUrl_if_low", "retry_arcdot_unlock"],
      },
    },
    hostAgent: {
      action: "ask_human_choose_create_or_import",
      /** Do not run until human picks A */
      commandAfterChoiceA: WALLET_CREATE_CMD,
      /** Do not put a private key in any shell you propose */
      importIsHumanLocalOnly: true,
      then: ["retry_arcdot_unlock"],
    },
    next: `Ask A (create) or B (import). Wait. Then settle wallet + fund if needed via ${fundUrl}, then retry unlock.`,
  };

  return { text, payload };
}

/** @deprecated Use hostAgentCreateShellDirective — kept for older imports */
export function hostAgentShellDirective(command: string): string {
  return [
    "HOST AGENT (Cursor / IDE):",
    `→ Only after the human confirms this path, propose:`,
    `     ${command}`,
    "→ Do NOT run wallet create until they choose create/new/A.",
    "→ Do NOT ask for a private key in chat.",
  ].join("\n");
}
