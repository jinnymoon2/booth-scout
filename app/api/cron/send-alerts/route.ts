import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    sent: 0,
    message: "Email alerts have been removed from BoothScout.",
  });
}

export async function POST() {
  return GET();
}
