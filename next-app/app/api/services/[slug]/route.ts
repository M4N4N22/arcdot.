import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/lib/catalog/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  try {
    const service = await getServiceBySlug(slug);
    if (!service || service.status !== "published") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      service: {
        id: service.id,
        slug: service.slug,
        title: service.title,
        description: service.description,
        price_usdc: service.price_usdc,
        price_wei: service.price_wei,
        owner_address: service.owner_address,
        // system_prompt intentionally omitted from public GET
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load service" }, { status: 500 });
  }
}
