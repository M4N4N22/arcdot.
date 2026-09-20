import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

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
  title: "arcdot. — Software pays software on Arc",
  description:
    "Agents discover gated APIs, pay tiny USDC amounts on Arc, and unlock replies instantly. Try the same path in the browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        dmSans.variable,
        instrumentSerif.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <div className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
