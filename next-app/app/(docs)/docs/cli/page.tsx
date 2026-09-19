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
      description="Command-line helpers that talk to your live arcdot. origin."
    >
      <DocsH2>Probe</DocsH2>
      <DocsP>
        Check that an origin speaks arcdot. before paying:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`npm run agent:probe -- "$ORIGIN"`}
      />

      <DocsH2>Paid unlock</DocsH2>
      <DocsP>
        Requires a funded Arc wallet. Point{" "}
        <code className="font-mono text-sm">ARCDOT_BASE_URL</code> at the live
        host:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`ARCDOT_BASE_URL="$ORIGIN" \\
AGENT_PRIVATE_KEY=0x… \\
npm run agent:pay -- quick-brief "One-line summary"`}
      />

      <DocsH2>Demo unlock</DocsH2>
      <DocsP>
        Only when the deployment has demo unlock enabled (rehearsal). Not
        on-chain settlement:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`ARCDOT_BASE_URL="$ORIGIN" \\
DEMO_AGENT_SECRET=… \\
npm run agent:demo -- quick-brief "Hello"`}
      />

      <DocsH2>Related</DocsH2>
      <DocsUl>
        <li>
          <Link href="/docs/agents" className="underline underline-offset-4 text-foreground">
            For agents
          </Link>
        </li>
        <li>
          <Link href="/docs/api/gateway" className="underline underline-offset-4 text-foreground">
            Unlock API
          </Link>
        </li>
        <li>
          <Link href="/console" className="underline underline-offset-4 text-foreground">
            Console
          </Link>{" "}
          — interactive sandbox
        </li>
      </DocsUl>
    </DocsProse>
  );
}
