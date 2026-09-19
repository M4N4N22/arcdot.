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
  AGENT_GIT_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";

export const metadata = { title: "CLI" };

export default function DocsCliPage() {
  return (
    <DocsProse
      pathname="/docs/cli"
      title="CLI"
      eyebrow="Tools"
      description="@arcdot/agent from GitHub — wallet, unlock, and MCP proxy from any machine."
    >
      <DocsCallout title="Install first">
        Run{" "}
        <code>{agentInstallCommands.npxWalletCreate}</code> once, then fund the
        printed address on Arc.
      </DocsCallout>

      <DocsH2>Buyer client</DocsH2>
      <DocsP>
        Keys stay under <code className="font-mono text-sm">~/.arcdot/</code>.
        Package: <code className="font-mono text-sm">{AGENT_GIT_PACKAGE}</code>
      </DocsP>
      <CodeBlock
        title="bash"
        code={`${agentInstallCommands.npxWalletCreate}
npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot wallet address
npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot wallet balance

npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot unlock --origin "$ORIGIN" --service quick-brief --prompt "One-line summary"

# stdio MCP proxy for Cursor:
npx --yes --package="${AGENT_GIT_PACKAGE}" arcdot mcp --origin "$ORIGIN"`}
      />

      <DocsH2>Monorepo helpers</DocsH2>
      <DocsP>
        From <code className="font-mono text-sm">next-app/</code> while
        developing this host:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`npm run agent:probe -- "$ORIGIN"
npm run agent:demo -- quick-brief "Hello"   # DEMO_AGENT_SECRET only`}
      />

      <DocsH2>Related</DocsH2>
      <DocsUl>
        <li>
          <Link href="/hub" className="underline underline-offset-4">
            MCP Hub
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/client"
            className="underline underline-offset-4"
          >
            Agent client
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
