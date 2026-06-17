import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("saved_alerts").insert({
      email: body.email,
      country: body.country || null,
      event_category: body.event_category || null,
      audience_type: body.audience_type || null,
      event_format: body.event_format || null,
      booth_status: body.booth_status || null,
      max_price: body.max_price ? Number(body.max_price) : null,
      date_from: body.date_from || null,
      date_to: body.date_to || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
