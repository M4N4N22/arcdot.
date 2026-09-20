import Image from "next/image";

type UsdcOnArcMarkProps = {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const SIZES = {
  sm: { token: 22, badge: 14 },
  md: { token: 28, badge: 16 },
  lg: { token: 36, badge: 20 },
} as const;

export function UsdcOnArcMark({
  size = "md",
  showLabel = true,
  className = "",
}: UsdcOnArcMarkProps) {
  const s = SIZES[size];

  return (
    <span className={["inline-flex items-center gap-2.5", className].join(" ")}>
      <span
        className={"relative inline-block shrink-0"}
        style={{ width: s.token, height: s.token }}
        aria-hidden
      >
        <Image
          src={"/brand/usdc-token-128.png"}
          alt={""}
          width={s.token}
          height={s.token}
          className={"rounded-full"}
        />
        <Image
          src={"/brand/arc-network.png"}
          alt={""}
          width={s.badge}
          height={s.badge}
          className={"absolute -bottom-0.5 -right-0.5 rounded-full bg-surface ring-2 ring-surface"}
        />
      </span>
      {showLabel ? (
        <span className={"text-sm font-medium tracking-tight text-foreground"}>
          USDC on Arc
        </span>
      ) : null}
    </span>
  );
}

export function UsdcOnArcPrice({
  amount,
  className = "",
  withMark = false,
}: {
  amount: string;
  className?: string;
  withMark?: boolean;
}) {
  return (
    <span
      className={["inline-flex items-center gap-1.5 tabular-nums", className].join(
        " ",
      )}
    >
      {withMark ? <UsdcOnArcMark size="sm" showLabel={false} /> : null}
      <span>
        <span className="font-medium text-foreground">{amount}</span>
        {" "}
        <span className="font-sans text-[0.92em] font-medium text-foreground">
          USDC on Arc
        </span>
      </span>
    </span>
  );
}

export function UsdcOnArcCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3.5",
        className,
      ].join(" ")}
    >
      <UsdcOnArcMark size="md" showLabel={false} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">
          USDC on Arc only
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Send USDC on the Arc network to this address. USDC on Ethereum, Base,
          Solana, or other chains will not show up here and cannot unlock tools.
        </p>
      </div>
    </div>
  );
}
