"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DiscoverButton({
  q,
  country,
}: {
  q: string;
  country: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function runDiscovery() {
    setStatus("loading");
    setMessage("Searching event sources with Ollama. This can take 30–90 seconds.");

    try {
      const response = await fetch("/api/discover-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q,
          country,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Discovery failed.");
      }

      setStatus("success");
      setMessage(
        `AI discovery finished. Scanned ${result.scanned || 0} pages and saved ${result.discovered || 0} event records.`
      );

      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to discover events. Make sure Ollama is running."
      );
    }
  }

  return (
    <div className="mb-8 rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">
            AI event discovery
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use local Ollama to scan event sources and add new IT booth events to the database.
          </p>
        </div>

        <button
          type="button"
          onClick={runDiscovery}
          disabled={status === "loading"}
          className="rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Discovering..." : "Run AI discovery"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 rounded-lg p-3 text-sm ${
            status === "error"
              ? "bg-red-50 text-red-700"
              : status === "success"
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
