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
    if (password === PANEL_CHECKER_TEST_PASSWORD) {
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
    <main className="flex flex-1 items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8">
        <div className="text-3xl mb-3 text-center">⚡</div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 text-center">
          Panel Checker — Private Testing
        </h1>
        <p className="text-sm text-zinc-500 mt-2 text-center">
          This tool is in private testing. Enter the test password to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            placeholder="Test password"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 text-white font-bold py-2.5 hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
