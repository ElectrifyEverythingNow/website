"use client";

import { useRef, useState } from "react";

interface PanelUploadProps {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  onSelect: (file: File | null) => void;
  onTrySample?: () => void;
}

export function PanelUpload({
  file,
  previewUrl,
  error,
  onSelect,
  onTrySample,
}: PanelUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Step 1 — Upload your panel photo
      </h2>
      <p className="text-sm text-zinc-600 mt-2">
        Show <strong>the full panel</strong>, the{" "}
        <strong>main breaker</strong>, and the{" "}
        <strong>label on the inside of the door</strong> if possible.
      </p>

      {/* Safety callout */}
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 leading-relaxed">
        <strong>Safety:</strong>{" "}
        Open the hinged door <em>only</em> if it is safe to do so.{" "}
        <strong>Do not</strong> remove screws, remove the metal cover
        (deadfront), or touch any wires. If anything looks damaged, wet, hot,
        or scorched, stop and call an electrician.
      </div>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-zinc-300 hover:border-green-500 hover:bg-green-50 transition-colors py-8 text-center"
        >
          {previewUrl ? (
            <span className="text-sm text-zinc-600">
              Tap to choose a different photo
            </span>
          ) : (
            <span className="text-sm text-zinc-600">
              <span className="block text-2xl mb-1">📷</span>
              Tap to upload or take a photo
            </span>
          )}
        </button>

        {previewUrl && (
          <div className="mt-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Panel photo preview"
              className="w-full max-h-80 object-contain rounded-lg border border-zinc-200 bg-zinc-50"
            />
            {file && (
              <p className="text-xs text-zinc-500 mt-1">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2" role="alert">
            {error}
          </p>
        )}

        {onTrySample && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span className="text-zinc-400">or</span>
            <button
              type="button"
              onClick={onTrySample}
              className="font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
            >
              Try with sample panel photo
            </button>
            <span className="text-zinc-400">— see the report flow</span>
          </div>
        )}
      </div>

      {/* Photo tips */}
      <button
        type="button"
        onClick={() => setTipsOpen((v) => !v)}
        className="mt-3 text-xs font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
        aria-expanded={tipsOpen}
        aria-controls="panel-photo-tips"
      >
        {tipsOpen ? "Hide" : "Show"} photo tips
      </button>
      {tipsOpen && (
        <div id="panel-photo-tips" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-bold text-green-800 uppercase tracking-wider">
              ✓ Good photo
            </div>
            <ul className="text-xs text-green-900 mt-2 space-y-1 list-disc list-inside">
              <li>Whole panel in frame, straight-on</li>
              <li>Main breaker visible at the top</li>
              <li>All breakers and any blank slots visible</li>
              <li>Inside-door label readable (numbers + brand)</li>
              <li>Bright, even light — no glare or hard shadows</li>
            </ul>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="text-xs font-bold text-red-800 uppercase tracking-wider">
              ✗ Avoid
            </div>
            <ul className="text-xs text-red-900 mt-2 space-y-1 list-disc list-inside">
              <li>Tightly cropped to one breaker</li>
              <li>Blurry or far away</li>
              <li>Door closed (covers the panel and label)</li>
              <li>Heavy glare from a flash on glossy metal</li>
              <li>Cover removed or wires touched (don&rsquo;t)</li>
            </ul>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500 mt-3">
        Your photo is used to analyze this report and is not saved by this tool.
      </p>
    </div>
  );
}
