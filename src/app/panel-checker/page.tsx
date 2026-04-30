"use client";

import { useEffect, useRef, useState } from "react";
import { PasswordGate } from "@/components/panel-checker/PasswordGate";
import { PanelUpload } from "@/components/panel-checker/PanelUpload";
import { UpgradeSelection } from "@/components/panel-checker/UpgradeSelection";
import { PanelResults } from "@/components/panel-checker/PanelResults";
import { ShareButtons } from "@/components/panel-checker/ShareButtons";
import {
  defaultSelectedUpgrades,
} from "@/lib/panel-checker/recommendations";
import type {
  AnalyzePanelResponse,
  UpgradeId,
} from "@/lib/panel-checker/types";

const MAX_BYTES = 12 * 1024 * 1024;

export default function PanelCheckerPage() {
  return (
    <PasswordGate>
      <PanelCheckerInner />
    </PasswordGate>
  );
}

function PanelCheckerInner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UpgradeId[]>(defaultSelectedUpgrades());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzePanelResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (response && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [response]);

  function handleSelectFile(next: File | null) {
    setUploadError(null);
    setApiError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setUploadError("Please choose an image file (JPEG, PNG, or WEBP).");
      return;
    }
    if (next.size > MAX_BYTES) {
      setUploadError("Image is too large. Please pick one under 12 MB.");
      return;
    }
    setFile(next);
  }

  async function handleAnalyze() {
    if (!file) {
      setUploadError("Upload a photo of your panel first.");
      return;
    }
    if (selected.length === 0) {
      setApiError("Pick at least one upgrade to analyze.");
      return;
    }
    setIsAnalyzing(true);
    setApiError(null);
    setResponse(null);

    const form = new FormData();
    form.append("image", file);
    form.append("upgrades", JSON.stringify(selected));

    try {
      const res = await fetch("/api/analyze-panel", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => null)) as
        | (AnalyzePanelResponse & { error?: string })
        | { error: string }
        | null;

      if (!data) {
        setApiError("The AI read failed. Please try again or use a clearer image.");
      } else if (!res.ok) {
        const msg =
          ("error" in data && data.error) ||
          "The AI read failed. Please try again or use a clearer image.";
        setApiError(msg);
        if ("analysis" in data && "recommendations" in data && data.analysis) {
          setResponse({
            analysis: data.analysis,
            recommendations: data.recommendations,
          });
        }
      } else if ("analysis" in data && "recommendations" in data) {
        setResponse({
          analysis: data.analysis,
          recommendations: data.recommendations,
        });
      } else {
        setApiError("Unexpected response from server.");
      }
    } catch {
      setApiError(
        "Could not reach the analysis service. Check your connection and try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  const lowConfidence =
    response && response.analysis.overallConfidence === "low";

  return (
    <main className="flex flex-1 flex-col bg-white">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-green-50 to-white pt-10 pb-6 px-4 text-center print:hidden">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Electrical Panel Checker
        </h1>
        <p className="text-lg text-zinc-500 mt-2 max-w-xl mx-auto">
          Upload your panel. See if it can handle electrification — and what
          cheaper options to ask about first.
        </p>
        <p className="text-xs text-amber-700 mt-3 inline-block bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          Private testing
        </p>
      </section>

      <div className="w-full max-w-5xl mx-auto px-4 pb-10 grid gap-5 lg:grid-cols-2">
        {/* Left column — inputs */}
        <div className="space-y-5 print:hidden">
          <PanelUpload
            file={file}
            previewUrl={previewUrl}
            error={uploadError}
            onSelect={handleSelectFile}
          />
          <UpgradeSelection selected={selected} onChange={setSelected} />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || selected.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-base px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing panel photo…
              </>
            ) : (
              "Analyze panel photo"
            )}
          </button>

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <details className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <summary className="font-semibold cursor-pointer">How this works</summary>
            <p className="mt-2 text-zinc-600">
              We send your photo to an AI model that extracts visible facts —
              brand, main breaker, open spaces, and condition flags. We use
              those facts plus the upgrades you picked to suggest cheaper
              options to ask an electrician about. Full service upgrade should
              be the last resort, not the first assumption.
            </p>
            <p className="mt-2 text-zinc-600">
              Your photo is used to analyze this report and is not saved.
            </p>
          </details>
        </div>

        {/* Right column — results */}
        <div ref={resultsRef} className="space-y-5">
          {!response && !isAnalyzing && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              Your report appears here once you upload and analyze.
            </div>
          )}
          {isAnalyzing && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              Reading your panel photo…
            </div>
          )}
          {response && (
            <>
              {lowConfidence && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
                  We couldn&rsquo;t read the panel clearly. Results are lower
                  confidence — try a clearer photo of the full panel and
                  inside-door label for better answers.
                </div>
              )}
              <PanelResults response={response} selectedUpgrades={selected} />
              <ShareButtons onPrint={handlePrint} />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100 mt-auto print:hidden">
        <p className="max-w-2xl mx-auto px-4 text-xs leading-relaxed">
          This is a planning tool only. It is not electrical advice, a
          permit-ready load calculation, or a substitute for a licensed
          electrician or local AHJ. Always have a qualified electrician verify
          breaker compatibility, wire sizing, load calculations, permits, and
          code compliance.
        </p>
        <p className="mt-3">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://electrifyeverythingnow.com"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            ElectrifyEverythingNow.com
          </a>
        </p>
      </footer>
    </main>
  );
}
