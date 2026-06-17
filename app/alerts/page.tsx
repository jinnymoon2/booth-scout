"use client";

import { useState } from "react";
import Link from "next/link";

const eventCategories = [
  ["", "Any IT category"],
  ["general_it", "General IT"],
  ["developer_tools", "Developer tools"],
  ["cloud_infrastructure", "Cloud infrastructure"],
  ["cybersecurity", "Cybersecurity"],
  ["ai_data", "AI / data"],
  ["devops_sre", "DevOps / SRE"],
  ["networking_infrastructure", "Networking / infrastructure"],
  ["enterprise_software", "Enterprise software"],
  ["saas", "SaaS"],
  ["startup_tech", "Startup / tech expo"],
  ["hardware_iot", "Hardware / IoT"],
  ["fintech_it", "Fintech IT"],
  ["healthtech_it", "Healthtech IT"],
  ["education_tech", "Education tech"],
  ["mixed", "Mixed"],
  ["unknown", "Unknown"],
];

export default function AlertsPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get("email"),
      country: formData.get("country"),
      event_category: formData.get("event_category"),
      audience_type: formData.get("audience_type"),
      event_format: formData.get("event_format"),
      booth_status: formData.get("booth_status"),
      max_price: formData.get("max_price"),
      date_from: formData.get("date_from"),
      date_to: formData.get("date_to"),
    };

    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      event.currentTarget.reset();
      setMessage("Alert saved.");
    } else {
      setMessage("Failed to save alert.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Home
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-slate-950">
          Create an IT booth alert
        </h1>

        <p className="mt-2 text-slate-600">
          Get notified when matching IT, software, cloud, cybersecurity, AI,
          infrastructure, or developer booth opportunities are added or updated.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-white p-6">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border p-3 text-slate-950"
          />

          <select name="country" className="w-full rounded-lg border p-3 text-slate-950">
            <option value="">Any country</option>
            <option value="United States">United States</option>
            <option value="Japan">Japan</option>
            <option value="Korea">Korea</option>
          </select>

          <select name="event_category" className="w-full rounded-lg border p-3 text-slate-950">
            {eventCategories.map(([value, label]) => (
              <option key={value || "all"} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select name="audience_type" className="w-full rounded-lg border p-3 text-slate-950">
            <option value="">Any audience</option>
            <option value="developers">Developers</option>
            <option value="it_decision_makers">IT decision makers</option>
            <option value="security_professionals">Security professionals</option>
            <option value="cloud_infra_engineers">Cloud / infra engineers</option>
            <option value="data_ai_teams">Data / AI teams</option>
            <option value="network_engineers">Network engineers</option>
            <option value="enterprise_tech_buyers">Enterprise tech buyers</option>
            <option value="startup_founders">Startup founders</option>
            <option value="marketers">Marketers</option>
            <option value="mixed">Mixed</option>
            <option value="unknown">Unknown</option>
          </select>

          <select name="event_format" className="w-full rounded-lg border p-3 text-slate-950">
            <option value="">Any format</option>
            <option value="expo_networking">Expo + networking</option>
            <option value="conference_sessions">Conference sessions</option>
            <option value="mixed">Mixed</option>
            <option value="unknown">Unknown</option>
          </select>

          <select name="booth_status" className="w-full rounded-lg border p-3 text-slate-950">
            <option value="">Any booth status</option>
            <option value="open">Open</option>
            <option value="waitlist">Waitlist</option>
            <option value="sold_out">Sold out</option>
            <option value="unknown">Unknown</option>
          </select>

          <input
            name="max_price"
            type="number"
            placeholder="Max booth price"
            className="w-full rounded-lg border p-3 text-slate-950"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input name="date_from" type="date" className="w-full rounded-lg border p-3 text-slate-950" />
            <input name="date_to" type="date" className="w-full rounded-lg border p-3 text-slate-950" />
          </div>

          <button className="w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white">
            Save alert
          </button>

          {message && <p className="text-sm text-slate-700">{message}</p>}
        </form>
      </div>
    </main>
  );
}
