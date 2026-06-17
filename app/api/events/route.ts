import { NextRequest, NextResponse } from "next/server";
import { discoverITEvents } from "../../lib/discover-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const country = searchParams.get("country") ?? undefined;
  const query = searchParams.get("query") ?? undefined;
  const rawLimit = Number(searchParams.get("limit") ?? 250);
  const limit = Number.isFinite(rawLimit) ? rawLimit : 250;

  try {
    const events = await discoverITEvents({
      country,
      query,
      limit,
    });

    return NextResponse.json({
      ok: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to discover IT events.",
      },
      {
        status: 500,
      }
    );
  }
}
