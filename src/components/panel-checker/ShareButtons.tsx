"use client";

import { useEffect, useState } from "react";

const TOOL_URL = "https://electrifyeverythingnow.com/panel-checker";
const SHARE_TEXT =
  "Check if your electrical panel can handle home electrification before approving an expensive upgrade.";

interface ShareButtonsProps {
  onPrint: () => void;
}

export function ShareButtons({ onPrint }: ShareButtonsProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  function nativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    navigator
      .share({ title: "Electrical Panel Checker", text: SHARE_TEXT, url: TOOL_URL })
      .catch(() => {
        // user cancelled or share unsupported — silent
      });
  }

  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    SHARE_TEXT,
  )}&url=${encodeURIComponent(TOOL_URL)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    TOOL_URL,
  )}`;
  const email = `mailto:?subject=${encodeURIComponent(
    "Electrical Panel Checker",
  )}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${TOOL_URL}`)}`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm print:hidden">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Save & share
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2"
        >
          Print / Save as PDF
        </button>
        {canShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2"
          >
            Share…
          </button>
        )}
        <a
          href={x}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-200 hover:border-zinc-300 text-sm font-semibold px-4 py-2 text-zinc-800"
        >
          Share on X
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-200 hover:border-zinc-300 text-sm font-semibold px-4 py-2 text-zinc-800"
        >
          LinkedIn
        </a>
        <a
          href={email}
          className="rounded-lg border border-zinc-200 hover:border-zinc-300 text-sm font-semibold px-4 py-2 text-zinc-800"
        >
          Email
        </a>
      </div>
      <p className="text-xs text-zinc-500 mt-2">
        Use Print &rsaquo; Save as PDF in your browser to download a copy of
        this report.
      </p>
    </div>
  );
}
