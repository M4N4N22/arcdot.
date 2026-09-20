/** Hub sub-navigation — mirrors Studio’s sidebar children pattern. */
export const HUB_NAV = [
  { href: "/hub", label: "Install", exact: true },
  { href: "/hub/config", label: "Universal config", exact: false },
  { href: "/hub/wallet", label: "Agent wallet", exact: false },
  { href: "/hub/editors", label: "IDEs & clients", exact: false },
  { href: "/hub/frameworks", label: "Frameworks", exact: false },
] as const;

export type HubNavHref = (typeof HUB_NAV)[number]["href"];
