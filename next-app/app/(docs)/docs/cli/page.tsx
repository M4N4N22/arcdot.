import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "CLI" };

export default function DocsCliPage() {
  return (
    <DocsProse
      pathname="/docs/cli"
      title="CLI"
      description="@arcdot/agent — wallet, unlock, and MCP proxy from any machine."
    >
      <DocsH2>Buyer client</DocsH2>
      <DocsP>
        No repo clone. Keys stay under{" "}
        <code className="font-mono text-sm">~/.arcdot/</code>:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`npx @arcdot/agent wallet create
npx @arcdot/agent wallet address
npx @arcdot/agent wallet balance

npx @arcdot/agent unlock --origin "$ORIGIN" --service quick-brief --prompt "One-line summary"

# stdio MCP proxy for Cursor:
npx @arcdot/agent mcp --origin "$ORIGIN"`}
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
          <Link
            href="/hub"
            className="underline underline-offset-4 text-foreground"
          >
            MCP Hub
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/client"
            className="underline underline-offset-4 text-foreground"
          >
            Agent client
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
