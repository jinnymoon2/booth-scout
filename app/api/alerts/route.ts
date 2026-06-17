import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Saved-filter alerts have been removed. Use the event browsing feature instead.",
    },
    {
      status: 410,
    }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Saved-filter alerts have been removed. Use the event browsing feature instead.",
    },
    {
      status: 410,
    }
  );
}
