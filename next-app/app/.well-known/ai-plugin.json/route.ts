import { NextResponse } from "next/server";
import { buildAiPluginManifest } from "@/lib/agent/wellKnown";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.json(buildAiPluginManifest(request), {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
