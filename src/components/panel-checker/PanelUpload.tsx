"use client";

import { useRef } from "react";

interface PanelUploadProps {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  onSelect: (file: File | null) => void;
}

export function PanelUpload({ file, previewUrl, error, onSelect }: PanelUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Step 1 — Upload your panel photo
      </h2>
      <p className="text-sm text-zinc-600 mt-2">
        Show the full panel, main breaker, and inside-door label if possible.
      </p>

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
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-3">
        Your photo is used to analyze this report and is not saved by this tool.
      </p>
    </div>
  );
}
