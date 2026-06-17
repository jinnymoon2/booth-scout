import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "cron/send-alerts",
    message: "Alert sending is currently disabled.",
    sent: 0,
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    route: "cron/send-alerts",
    message: "Alert sending is currently disabled.",
    sent: 0,
  });
}
