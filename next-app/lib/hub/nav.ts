/** Hub sub-navigation — order matches the real buyer path. */
export const HUB_NAV = [
  { href: "/hub", label: "Get started", exact: true },
  { href: "/fund", label: "Fund", exact: false },
  { href: "/hub/editors", label: "Connect IDE", exact: false },
  { href: "/hub/frameworks", label: "Frameworks", exact: false },
  { href: "/hub/wallet", label: "Wallet help", exact: false },
  { href: "/hub/config", label: "Advanced", exact: false },
] as const;

export type HubNavHref = (typeof HUB_NAV)[number]["href"];

/** Canonical buyer path — keep Hub + docs in sync with this. */
export const BUYER_STEPS = [
  {
    n: "1",
    title: "Create a wallet",
    body: "One command on your machine. No npm install required for IDE MCP.",
    href: "/hub",
  },
  {
    n: "2",
    title: "Fund it",
    body: "Send about 0.05 USDC on Arc (not other chains). Use /fund for QR and live balance.",
    href: "/fund",
  },
  {
    n: "3",
    title: "Connect your IDE",
    body: "Paste the local MCP proxy JSON. Paid unlocks settle automatically.",
    href: "/hub/editors",
  },
] as const;
