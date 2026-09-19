import { NextResponse } from "next/server";
import { listRequestsForSeller } from "@/lib/catalog/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  try {
    const sales = await listRequestsForSeller(address);
    return NextResponse.json({ sales });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load sales" }, { status: 500 });
  }
}
