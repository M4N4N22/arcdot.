type BrandMarkProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
  xl: "h-14 w-14 text-xl",
} as const;

/** Brand “a.” mark when a tool has no cover image. */
export function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <div
      aria-hidden
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display tracking-tight text-foreground shadow-sm",
        sizeClass[size],
        className,
      ].join(" ")}
    >
      a.
    </div>
  );
}
