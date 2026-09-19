import { AppShell } from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-svh max-h-svh flex-1 flex-col overflow-hidden ">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 100% 0%, var(--glow), transparent 50%), linear-gradient(180deg, #ebe7df 0%, var(--background) 28%)",
        }}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
