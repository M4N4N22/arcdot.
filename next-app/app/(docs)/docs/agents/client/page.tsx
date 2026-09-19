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
      description="Probe a live origin and pay against it with the in-repo agent helpers."
    >
      <DocsH2>Probe a host</DocsH2>
      <DocsP>
        Confirms well-known identity, health (including durable store), catalog,
        and prints pay instructions for the first published service:
      </DocsP>
      <CodeBlock
        title="bash"
        code={`npm run agent:probe -- "$ORIGIN"`}
      />
      <DocsP>
        Expect chain <code className="font-mono text-sm">5042</code>,{" "}
        <code className="font-mono text-sm">price_wei</code>, seller address, and
        a 402 payment object from an unpaid unlock attempt.
      </DocsP>

      <DocsH2>Pay and unlock</DocsH2>
      <CodeBlock
        title="bash"
        code={`ARCDOT_BASE_URL="$ORIGIN" \\
AGENT_PRIVATE_KEY=0x… \\
npm run agent:pay -- <slug> "Your prompt"`}
      />
      <DocsP>
        Internals live under{" "}
        <code className="font-mono text-sm">lib/agent/</code> (
        <code className="font-mono text-sm">paidRequest</code>, 402 parsers) and
        the in-repo package{" "}
        <code className="font-mono text-sm">@arcdot/agent</code> for scripts.
      </DocsP>

      <DocsH2>Paid but failed</DocsH2>
      <DocsP>
        If settlement succeeds and the upstream reply fails, the gateway issues a
        one-time unlock credit on that payment confirmation. Retry the same
        transaction (same headers) within 24h — no second deposit. Details:{" "}
        <Link
          href="/docs/errors"
          className="underline underline-offset-4 text-foreground"
        >
          Responses & errors
        </Link>
        .
      </DocsP>

      <DocsH2>Related</DocsH2>
      <DocsUl>
        <li>
          <Link
            href="/docs/agents"
            className="underline underline-offset-4 text-foreground"
          >
            For agents
          </Link>
        </li>
        <li>
          <Link
            href="/docs/cli"
            className="underline underline-offset-4 text-foreground"
          >
            CLI
          </Link>
        </li>
        <li>
          <Link
            href="/docs/api/gateway"
            className="underline underline-offset-4 text-foreground"
          >
            Unlock API
          </Link>
        </li>
      </DocsUl>
    </DocsProse>
  );
}
