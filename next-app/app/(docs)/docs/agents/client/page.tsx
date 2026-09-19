import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Agent client" };

export default function DocsAgentClientPage() {
  return (
    <DocsProse
      pathname="/docs/agents/client"
      title="Agent client"
      description="Use @arcdot/agent — wallet, auto-settle, and MCP proxy without cloning this repo."
    >
      <DocsH2>Install</DocsH2>
      <CodeBlock
        title="bash"
        code={`npx @arcdot/agent --help
# or: npm i @arcdot/agent`}
      />

      <DocsH2>Wallet + unlock</DocsH2>
      <CodeBlock
        title="bash"
        code={`npx @arcdot/agent wallet create
# fund the address on Arc Mainnet (5042), then:
npx @arcdot/agent unlock --origin "$ORIGIN" --service <slug> --prompt "Your prompt"`}
      />
      <DocsP>
        SDK:{" "}
        <code className="font-mono text-sm">createArcdotAgent</code> from{" "}
        <code className="font-mono text-sm">@arcdot/agent</code> —{" "}
        <code className="font-mono text-sm">unlock</code> and{" "}
        <code className="font-mono text-sm">callMcpTool</code> auto-settle.
      </DocsP>

      <DocsH2>Cursor MCP proxy</DocsH2>
      <DocsP>
        Do not paste the raw remote{" "}
        <code className="font-mono text-sm">/api/mcp</code> URL if you need
        paid tools. Use the local proxy from{" "}
        <Link href="/hub" className="underline underline-offset-4">
          MCP Hub
        </Link>
        .
      </DocsP>

      <DocsH2>Probe a host</DocsH2>
      <DocsP>
        From this monorepo (contributors): confirms well-known, health, catalog,
        and 402 pay instructions:
      </DocsP>
      <CodeBlock title="bash" code={`npm run agent:probe -- "$ORIGIN"`} />

      <DocsH2>Paid but failed</DocsH2>
      <DocsP>
        If settlement succeeded but the upstream reply failed, follow unlock
        credit rules in the gateway docs — do not double-pay the same{" "}
        <code className="font-mono text-sm">paymentId</code>.
      </DocsP>
      <DocsUl>
        <li>
          <Link
            href="/docs/api/gateway"
            className="underline underline-offset-4 text-foreground"
          >
            Unlock API
          </Link>
        </li>
        <li>
          <Link
            href="/docs/errors"
            className="underline underline-offset-4 text-foreground"
          >
            Errors
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
