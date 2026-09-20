"use client";

import { useEffect, useState } from "react";

const PLACEHOLDER_ORIGIN = "https://your-app.vercel.app";

/** Live deployment origin for MCP snippets (client-only). */
export function useHubOrigin() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return origin;
}
