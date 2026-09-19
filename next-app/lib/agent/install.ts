/**
 * GitHub-only distribution for @arcdot/agent (until npm publish).
 * Repo: https://github.com/M4N4N22/arcdot.
 */

export const AGENT_GITHUB_REPO = "M4N4N22/arcdot.";
export const AGENT_GITHUB_URL = `https://github.com/${AGENT_GITHUB_REPO}`;
export const AGENT_PACKAGE_PATH = "packages/arcdot-agent";

/** npm/npx package specifier for the monorepo subdirectory */
export const AGENT_GIT_PACKAGE = `github:${AGENT_GITHUB_REPO}#path:${AGENT_PACKAGE_PATH}`;

export const agentInstallCommands = {
  /** One-shot CLI via npx (GitHub) */
  npxWalletCreate: `npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot wallet create`,
  npxUnlock: (origin: string) =>
    `npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot unlock --origin ${origin} --service quick-brief --prompt "Hi"`,
  npxMcp: (origin: string) =>
    `npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot mcp --origin ${origin}`,
  /** Add as a dependency */
  npmInstall: `npm install "${AGENT_GIT_PACKAGE}"`,
  /** Clone + link (offline / contributors) */
  cloneLink: `# clone once
git clone ${AGENT_GITHUB_URL}.git
cd arcdot./${AGENT_PACKAGE_PATH}
npm install && npm run build && npm link
arcdot wallet create`,
} as const;

/** Cursor mcp.json using GitHub-backed npx */
export function agentMcpProxyConfig(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return JSON.stringify(
    {
      mcpServers: {
        arcdot: {
          command: "npx",
          args: [
            "--yes",
            `--package=${AGENT_GIT_PACKAGE}`,
            "arcdot",
            "mcp",
            "--origin",
            host,
          ],
        },
      },
    },
    null,
    2,
  );
}
