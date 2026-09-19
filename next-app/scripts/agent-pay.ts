/**
 * Thin alias → @arcdot/agent unlock (monorepo contributors).
 * End users should run: npx @arcdot/agent unlock …
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const service = args[0] || "quick-brief";
const prompt = args.slice(1).join(" ") || "Say hello in one short sentence.";
const origin =
  process.env.ARCDOT_BASE_URL ??
  process.env.ARCDOT_ORIGIN ??
  "http://localhost:3000";

const pkgCli = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../packages/arcdot-agent/bin/arcdot.mjs",
);

const result = spawnSync(
  process.execPath,
  [
    pkgCli,
    "unlock",
    "--origin",
    origin,
    "--service",
    service,
    "--prompt",
    prompt,
  ],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
