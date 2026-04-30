"use client";

import { useEffect, useRef, useState } from "react";
import { PasswordGate } from "@/components/panel-checker/PasswordGate";
import { PanelUpload } from "@/components/panel-checker/PanelUpload";
import { UpgradeSelection } from "@/components/panel-checker/UpgradeSelection";
import { PanelResults } from "@/components/panel-checker/PanelResults";
import { ShareButtons } from "@/components/panel-checker/ShareButtons";
import { ReportPreview } from "@/components/panel-checker/ReportPreview";
import {
  computeRecommendations,
  defaultSelectedUpgrades,
} from "@/lib/panel-checker/recommendations";
import type {
  AnalyzePanelResponse,
  DetectedPanel,
  UpgradeId,
} from "@/lib/panel-checker/types";
import { compressImageForUpload } from "@/lib/panel-checker/image";
import {
  SAMPLE_ANALYSIS,
  SAMPLE_IMAGE_URL,
  SAMPLE_SELECTED_UPGRADES,
} from "@/lib/panel-checker/sample";
import { fallbackAnalysis } from "@/lib/panel-checker/normalize";
import { EmailCapture } from "@/components/panel-checker/EmailCapture";
import { NextSteps } from "@/components/panel-checker/NextSteps";

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
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzePanelResponse | null>(null);
  const [overrides, setOverrides] = useState<Partial<DetectedPanel>>({});
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
    setApiWarning(null);
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
    setApiWarning(null);
    setResponse(null);
    setOverrides({});

    let uploadFile = file;
    try {
      uploadFile = await compressImageForUpload(file);
    } catch {
      // best-effort — fall back to original
    }

    const form = new FormData();
    form.append("image", uploadFile);
    form.append("upgrades", JSON.stringify(selected));

    let res: Response | null = null;
    try {
      res = await fetch("/api/analyze-panel", {
        method: "POST",
        body: form,
      });
    } catch (err) {
      console.error("[panel-checker] network error:", err);
      // Fall back to a manually-fillable report so the user still sees their
      // selected upgrades reflected in spacesNeeded / largestBreaker.
      setApiError(
        "Couldn't reach the analysis service. Fill in the panel details below — your selected upgrades are already factored in.",
      );
      setResponseFromFallback(
        "Network error — couldn't reach the AI vision service.",
        selected,
      );
      setIsAnalyzing(false);
      return;
    }

    type ApiBody = Partial<AnalyzePanelResponse> & {
      error?: string;
      warning?: string;
    };
    let data: ApiBody | null = null;
    try {
      data = (await res.json()) as ApiBody;
    } catch {
      // Response was not JSON (e.g. a Cloudflare 502 HTML page).
      data = null;
    }

    if (!data) {
      setApiError(
        res.status >= 500
          ? "The analysis service is having a moment. Fill in the panel details below — your selected upgrades are already factored in."
          : "Unexpected response from server. Please try again.",
      );
      setResponseFromFallback(
        "Service returned a non-JSON response.",
        selected,
      );
      setIsAnalyzing(false);
      return;
    }

    if (data.analysis && data.recommendations) {
      setResponse({
        analysis: data.analysis,
        recommendations: data.recommendations,
      });
      if (data.warning) setApiWarning(data.warning);
      if (data.error && !res.ok) setApiError(data.error);
    } else {
      setApiError(
        data.error ||
          (res.status === 500
            ? "The analysis service isn't configured yet. Fill in the panel details below — your selected upgrades are already factored in."
            : "The AI couldn't read this image. Fill in the panel details below — your selected upgrades are already factored in."),
      );
      setResponseFromFallback(
        data.error || "AI vision call did not return a usable result.",
        selected,
      );
    }

    setIsAnalyzing(false);
  }

  function setResponseFromFallback(reason: string, upgrades: UpgradeId[]) {
    const fb = fallbackAnalysis(reason);
    setResponse({
      analysis: fb,
      recommendations: computeRecommendations(fb, upgrades),
    });
  }

  async function handleTrySample() {
    setUploadError(null);
    setApiError(null);
    setApiWarning(null);
    setOverrides({});
    try {
      const res = await fetch(SAMPLE_IMAGE_URL);
      const blob = await res.blob();
      const sampleFile = new File([blob], "sample-panel.svg", {
        type: blob.type || "image/svg+xml",
      });
      setFile(sampleFile);
      setSelected(SAMPLE_SELECTED_UPGRADES);
      // Skip the API call — use a hardcoded sample so the demo always works.
      setResponse({
        analysis: SAMPLE_ANALYSIS,
        recommendations: computeRecommendations(
          SAMPLE_ANALYSIS,
          SAMPLE_SELECTED_UPGRADES,
        ),
      });
      setApiWarning(
        "Showing a sample report. Upload your own photo to analyze your panel.",
      );
    } catch (err) {
      console.error("[panel-checker] sample load failed:", err);
      setUploadError(
        "Couldn't load the sample photo. Please try uploading your own.",
      );
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
            onTrySample={handleTrySample}
          />
          <UpgradeSelection selected={selected} onChange={setSelected} />

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !file || selected.length === 0}
              aria-disabled={isAnalyzing || !file || selected.length === 0}
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
              ) : !file ? (
                "Upload a panel photo to continue"
              ) : selected.length === 0 ? (
                "Pick at least one upgrade"
              ) : (
                "Analyze panel photo"
              )}
            </button>
            <p className="text-xs text-zinc-500 text-center">
              Planning estimate only. Have a licensed electrician verify before
              doing work.
            </p>
          </div>

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{apiError}</p>
              {response && (
                <p className="mt-1 text-xs">
                  You can still fill in or correct any panel details below to
                  see recommendations.
                </p>
              )}
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
          {!response && !isAnalyzing && <ReportPreview />}
          {isAnalyzing && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              Reading your panel photo…
            </div>
          )}
          {response && (() => {
            const aiDetected = response.analysis.detected;
            const effectiveDetected: DetectedPanel = {
              ...aiDetected,
              ...overrides,
            };
            const effectiveAnalysis = {
              ...response.analysis,
              detected: effectiveDetected,
            };
            const liveRecommendations = computeRecommendations(
              effectiveAnalysis,
              selected,
            );
            return (
              <>
                {apiWarning && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
                    {apiWarning}
                  </div>
                )}
                {!apiWarning && lowConfidence && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
                    We couldn&rsquo;t read the panel clearly. Edit any field
                    below if you know better, or try a clearer photo of the
                    full panel and the inside-door label.
                  </div>
                )}
                <PanelResults
                  analysis={response.analysis}
                  effectiveDetected={effectiveDetected}
                  aiDetected={aiDetected}
                  overrides={overrides}
                  onOverridesChange={setOverrides}
                  recommendations={liveRecommendations}
                  selectedUpgrades={selected}
                />
                <ShareButtons onPrint={handlePrint} />
                <NextSteps current="panel-checker" />
                <EmailCapture />
              </>
            );
          })()}
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
