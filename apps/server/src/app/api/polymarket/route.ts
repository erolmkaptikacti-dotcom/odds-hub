import { NextResponse } from "next/server";
import { fetchSourceEvents } from "@/lib/fetchSource";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body = await fetchSourceEvents("polymarket", searchParams.get("sport"));
  return NextResponse.json(body);
}
