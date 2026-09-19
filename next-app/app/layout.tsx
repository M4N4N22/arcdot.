import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "arcdot. — Pay-as-you-go API access for agents",
  description:
    "Gate your APIs behind tiny USDC payments on Arc. Agents pay, unlock, and get answers — instantly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <div className="relative flex min-h-full flex-col bg-background text-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% -10%, var(--glow), transparent 55%), linear-gradient(180deg, #ece8e0 0%, var(--background) 40%)",
              }}
            />
            <SiteHeader />
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
