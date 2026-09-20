import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsCallout,
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";
import {
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";

export const metadata = { title: "CLI" };

export default function DocsCliPage() {
  return (
    <DocsProse
      pathname="/docs/cli"
      title="CLI"
      eyebrow="Tools"
      description="@arcdot/agent on npm — wallet, unlock, and MCP proxy from any machine."
    >
      <DocsCallout title="Install first">
        Run{" "}
        <code>{agentInstallCommands.npxWalletCreate}</code> once, then fund the
        printed address on Arc.
      </DocsCallout>

      <DocsH2>Buyer client</DocsH2>
      <DocsP>
        Keys stay under <code className="font-mono text-sm">~/.arcdot/</code>.
        Package: <code className="font-mono text-sm">{AGENT_NPM_PACKAGE}</code>
      </DocsP>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
npx --yes ${AGENT_NPM_PACKAGE} wallet address
npx --yes ${AGENT_NPM_PACKAGE} wallet balance

npx --yes ${AGENT_NPM_PACKAGE} unlock --origin "$ORIGIN" --service quick-brief --prompt "One-line summary"

# stdio MCP proxy for Cursor:
npx --yes ${AGENT_NPM_PACKAGE} mcp --origin "$ORIGIN"`}
      />

      <DocsH2>Monorepo helpers</DocsH2>
      <DocsP>
        From <code className="font-mono text-sm">next-app/</code> while
        developing this repo:
      </DocsP>
      <DocsUl>
        <li>
          <code className="font-mono text-sm">npm run agent:wallet</code>
        </li>
        <li>
          <code className="font-mono text-sm">npm run agent:pay</code>
        </li>
        <li>
          <code className="font-mono text-sm">npm run agent:probe</code>
        </li>
      </DocsUl>
      <DocsP>
        Prefer the npm package for real agents. See{" "}
        <Link
          href="/docs/agents/client"
          className="underline underline-offset-4 text-foreground"
        >
          Agent client
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
