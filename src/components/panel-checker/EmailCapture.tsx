"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "panel-checker" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm print:hidden">
      <h3 className="text-sm font-bold uppercase tracking-wider text-green-800">
        Want the full home electrification planner?
      </h3>
      <p className="text-sm text-zinc-700 mt-2">
        We&rsquo;re building a full home electrification planner — load
        sequencing, rebates, install sequencing, and more. Get one email when
        it launches.
      </p>

      {status === "success" ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          You&rsquo;re in! We&rsquo;ll email you when the planner is ready.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2" noValidate>
          <label htmlFor="panel-checker-email" className="sr-only">
            Email address
          </label>
          <input
            id="panel-checker-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@email.com"
            aria-invalid={status === "error"}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 transition-colors"
          >
            {status === "submitting" ? "Saving…" : "Notify Me"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-xs text-red-600 mt-2" role="alert">
          Couldn&rsquo;t save that. Check the address and try again.
        </p>
      )}
      <p className="text-xs text-zinc-500 mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
