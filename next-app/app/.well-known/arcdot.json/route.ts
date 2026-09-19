import { NextResponse } from "next/server";
import { buildAgentManifest } from "@/lib/agent/wellKnown";
import {
  getProfilesByAddresses,
  listPublishedServices,
} from "@/lib/catalog/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const services = await listPublishedServices();
    const profiles = await getProfilesByAddresses(
      services.map((s) => s.owner_address),
    );
    const sellerNames: Record<string, string | null> = {};
    for (const [addr, p] of profiles) {
      sellerNames[addr] = p.display_name;
    }
    return NextResponse.json(buildAgentManifest(request, services, sellerNames), {
      headers: {
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not build agent manifest" },
      { status: 500 },
    );
  }
}
