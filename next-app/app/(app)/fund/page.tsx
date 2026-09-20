import type { Metadata } from "next";
import { FundPage } from "@/components/fund/FundPage";

export const metadata: Metadata = {
  title: "Fund your agent",
  description:
    "Top up your local agent wallet with USDC on Arc — QR, balance, and copy address. Keys stay on your machine. USDC on other networks will not appear.",
};

export default function FundRoutePage() {
  return <FundPage />;
}
