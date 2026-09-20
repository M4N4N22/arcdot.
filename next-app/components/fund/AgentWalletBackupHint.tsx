import Link from "next/link";

/** SaaS-friendly backup reminder — never ask for or display the private key here. */
export function AgentWalletBackupHint({
  className = "",
}: {
  className?: string;
}) {
  return (
    <aside
      className={[
        "rounded-xl border border-line bg-surface-muted px-4 py-3.5",
        className,
      ].join(" ")}
    >
      <p className="text-[13px] font-semibold text-foreground">
        Back up access to this wallet
      </p>
      <div className="mt-1 space-y-2 text-[13px] leading-relaxed text-muted [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
        <p>
          This page only remembers the{" "}
          <span className="font-medium text-foreground">address</span> in your
          browser. The recovery key lives on the machine that created the
          wallet — if that machine is wiped and you have no backup, any USDC
          on this address is gone.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            When you ran <code>wallet create</code>, the recovery key was
            printed once — save it offline (password manager or encrypted note).
          </li>
          <li>
            Or copy the file <code>~/.arcdot/wallet.json</code> to a safe place.
          </li>
          <li>
            New machine: restore that file, run{" "}
            <code>wallet import --key 0x…</code> in your own terminal, or set{" "}
            <code>ARCDOT_PRIVATE_KEY</code> in MCP env — never paste it into
            arcdot. websites or IDE chat.
          </li>
        </ul>
        <p>
          Need a fresh wallet or to restore one?{" "}
          <Link
            href="/hub/wallet"
            className="text-foreground underline underline-offset-4"
          >
            Hub → Wallet help
          </Link>{" "}
          has create and import commands.
        </p>
      </div>
    </aside>
  );
}
