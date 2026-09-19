import { AppShell } from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 100% 0%, var(--glow), transparent 50%), linear-gradient(180deg, #ebe7df 0%, var(--background) 28%)",
        }}
      />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
