/**
 * Thin alias → @arcdot/agent wallet create (monorepo contributors).
 * End users: npx @arcdot/agent wallet create
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgCli = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../packages/arcdot-agent/bin/arcdot.mjs",
);

const extra = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  [pkgCli, "wallet", "create", ...extra],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
