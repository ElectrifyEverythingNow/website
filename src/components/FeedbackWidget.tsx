"use client";

import { FormEvent, useMemo, useState } from "react";

type FeedbackWidgetProps = {
  toolId: string;
  resultType?: string;
  source?: string;
  title?: string;
  compact?: boolean;
};

const FEEDBACK_ENDPOINT = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT || "";

export function FeedbackWidget({
  toolId,
  resultType = "",
  source = "website",
  title = "Was this useful?",
  compact = false,
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [confused, setConfused] = useState("");
  const [better, setBetter] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  const pageUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!FEEDBACK_ENDPOINT) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const form = new FormData();
    form.append("source", source);
    form.append("page_url", pageUrl);
    form.append("tool_id", toolId);
    form.append("result_type", resultType);
    form.append("usefulness_rating", rating);
    form.append("user_goal", userGoal);
    form.append("what_confused_you", confused);
    form.append("what_would_make_this_better", better);
    form.append("email_optional", email);

    try {
      await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: form,
      });
      setStatus("submitted");
      setUserGoal("");
      setConfused("");
      setBetter("");
      setEmail("");
    } catch (error) {
      console.error("[feedback] submission failed", error);
      setStatus("error");
    }
  }

  if (status === "submitted") {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900 print:hidden">
        <p className="font-semibold">Thanks. This is exactly the kind of feedback that will make the tools better.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm print:hidden">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-600">
          Quick anonymous feedback. No photos are kept, and email is optional.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Usefulness rating">
          {[
            ["yes", "Yes"],
            ["kind-of", "Kind of"],
            ["no", "No"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                rating === value
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-zinc-700">
          What were you trying to figure out?
          <textarea
            value={userGoal}
            onChange={(event) => setUserGoal(event.target.value)}
            rows={compact ? 2 : 3}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="Example: I was told I need a panel upgrade and wanted a second opinion."
          />
        </label>

        {!compact && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              What confused you?
              <textarea
                value={confused}
                onChange={(event) => setConfused(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Anything unclear, too technical, or missing?"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              What would make this better?
              <textarea
                value={better}
                onChange={(event) => setBetter(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="A different tool, clearer next step, better article, etc."
              />
            </label>
          </div>
        )}

        <label className="block text-sm font-medium text-zinc-700">
          Email, optional
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="Only if you want follow-up or new tool updates"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Send feedback"}
          </button>
          {status === "error" && (
            <p className="text-xs text-amber-700">
              Feedback endpoint is not live yet. Try again after the next deploy.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
