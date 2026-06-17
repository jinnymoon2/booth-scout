import { NextResponse } from "next/server";
import { discoverAndStoreEvents } from "../../lib/event-discovery";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const result = await discoverAndStoreEvents({
      q: body.q || "",
      country: body.country || "",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[discover-events:error]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to discover events.",
      },
      { status: 500 }
    );
  }
}
