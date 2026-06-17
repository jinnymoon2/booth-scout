"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmitEventPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      submitter_name: formData.get("submitter_name"),
      submitter_email: formData.get("submitter_email"),
      event_name: formData.get("event_name"),
      event_url: formData.get("event_url"),
      sponsor_url: formData.get("sponsor_url"),
      country: formData.get("country"),
      city: formData.get("city"),
      message: formData.get("message"),
    };

    const response = await fetch("/api/submit-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Something went wrong.");
      setStatus("error");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Home
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-slate-950">Submit an event</h1>

        <p className="mt-2 text-slate-600">
          Add a tech or developer event with booth, sponsorship, or expo opportunities.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-white p-6">
          <Input name="submitter_name" label="Your name" />
          <Input name="submitter_email" label="Your email" type="email" required />
          <Input name="event_name" label="Event name" required />
          <Input name="event_url" label="Event website URL" />
          <Input name="sponsor_url" label="Sponsor / exhibit URL" />
          <Input name="country" label="Country" />
          <Input name="city" label="City" />

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Notes</span>
            <textarea
              name="message"
              className="mt-1 min-h-32 w-full rounded-lg border p-3 text-slate-950"
              placeholder="Booth status, deadline, pricing, audience, or anything useful."
            />
          </label>

          <button
            disabled={status === "loading"}
            className="w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {status === "loading" ? "Submitting..." : "Submit event"}
          </button>

          {status === "success" && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Submitted. The listing will be reviewed before publishing.
            </p>
          )}

          {status === "error" && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

function Input({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border p-3 text-slate-950"
      />
    </label>
  );
}
