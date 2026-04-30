"use client";

import { useEffect, useState } from "react";

// TODO(panel-checker): Remove this temporary password gate before public launch.
const PANEL_CHECKER_TEST_PASSWORD = "timber";
const SESSION_KEY = "een_panel_checker_unlocked";

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage may be unavailable; fall through to gate
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim() === PANEL_CHECKER_TEST_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // ignore — still unlock for the session
      }
      setUnlocked(true);
      setError(null);
    } else {
      setError("Incorrect test password.");
    }
  }

  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center bg-white px-4 py-16" />
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 sm:p-8">
        {/* Brand strip */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-700 mb-6">
          <span className="text-base" aria-hidden>
            ⚡
          </span>
          ElectrifyEverythingNow
        </div>

        {/* Status pill */}
        <div className="text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            Private testing
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 text-center mt-3">
          Electrical Panel Checker
        </h1>
        <p className="text-sm text-zinc-600 mt-3 text-center leading-relaxed">
          Panel Checker is in private testing. Enter the test password to
          preview it.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
          <label htmlFor="panel-checker-password" className="sr-only">
            Test password
          </label>
          <input
            id="panel-checker-password"
            type="password"
            autoComplete="off"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "panel-checker-password-error" : undefined}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
            placeholder="Test password"
          />
          {error && (
            <p
              id="panel-checker-password-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={password.trim().length === 0}
            className="w-full rounded-lg bg-green-600 text-white font-bold py-2.5 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-zinc-500 text-center mt-5">
          Don&rsquo;t have a password? Email{" "}
          <a
            href="mailto:jlake1@gmail.com?subject=Panel%20Checker%20test%20access"
            className="text-green-700 underline underline-offset-2"
          >
            jlake1@gmail.com
          </a>{" "}
          for access.
        </p>
      </div>
    </main>
  );
}
