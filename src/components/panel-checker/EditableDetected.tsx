"use client";

import type { DetectedPanel } from "@/lib/panel-checker/types";

interface EditableDetectedProps {
  detected: DetectedPanel;
  aiDetected: DetectedPanel;
  overrides: Partial<DetectedPanel>;
  onChange: (overrides: Partial<DetectedPanel>) => void;
}

const BRAND_OPTIONS = [
  "Unknown",
  "Square D",
  "Siemens",
  "Eaton",
  "Cutler-Hammer",
  "GE",
  "Leviton",
  "Murray",
  "Federal Pacific",
  "Zinsco",
  "Other",
];

const MAIN_BREAKER_OPTIONS = [
  { value: 0, label: "Unknown" },
  { value: 60, label: "60 A" },
  { value: 100, label: "100 A" },
  { value: 125, label: "125 A" },
  { value: 150, label: "150 A" },
  { value: 200, label: "200 A" },
  { value: 225, label: "225 A" },
  { value: 400, label: "400 A" },
];

const TANDEM_OPTIONS: Array<{ value: DetectedPanel["tandemQuadCompatibility"]; label: string }> = [
  { value: "unknown", label: "Unknown" },
  { value: "likely yes", label: "Likely yes" },
  { value: "likely no", label: "Likely no" },
];

const CONDITION_FLAG_OPTIONS = [
  "rust",
  "burn marks",
  "water damage",
  "obsolete-looking equipment",
  "double taps suspected",
  "missing cover",
];

function brandOptionsWithAi(aiBrand: string): string[] {
  if (aiBrand && !BRAND_OPTIONS.includes(aiBrand) && aiBrand !== "Unknown") {
    return [...BRAND_OPTIONS, aiBrand];
  }
  return BRAND_OPTIONS;
}

export function EditableDetected({
  detected,
  aiDetected,
  overrides,
  onChange,
}: EditableDetectedProps) {
  function update(patch: Partial<DetectedPanel>) {
    onChange({ ...overrides, ...patch });
  }

  function toggleConditionFlag(flag: string) {
    const current = (detected.conditionFlags || []).filter(
      (f) => f.toLowerCase() !== "none",
    );
    const has = current.some((f) => f.toLowerCase() === flag.toLowerCase());
    const next = has
      ? current.filter((f) => f.toLowerCase() !== flag.toLowerCase())
      : [...current, flag];
    update({ conditionFlags: next.length ? next : ["none"] });
  }

  function reset() {
    onChange({});
  }

  const isOverridden = (key: keyof DetectedPanel) => key in overrides;
  const hasAnyOverride = Object.keys(overrides).length > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Detected panel
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Edit any field if you know better than the AI. Recommendations
            update live.
          </p>
        </div>
        {hasAnyOverride && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 underline underline-offset-2"
          >
            Reset to AI values
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Field
          label="Brand"
          overridden={isOverridden("brand")}
          aiValue={aiDetected.brand}
        >
          <select
            value={detected.brand}
            onChange={(e) => update({ brand: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            {brandOptionsWithAi(aiDetected.brand).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Main breaker"
          overridden={isOverridden("mainBreakerAmps")}
          aiValue={
            aiDetected.mainBreakerAmps
              ? `${aiDetected.mainBreakerAmps} A`
              : "Unknown"
          }
        >
          <select
            value={detected.mainBreakerAmps}
            onChange={(e) =>
              update({ mainBreakerAmps: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            {MAIN_BREAKER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Total spaces"
          overridden={isOverridden("totalSpaces")}
          aiValue={aiDetected.totalSpaces ? String(aiDetected.totalSpaces) : "Unknown"}
        >
          <input
            type="number"
            min={0}
            max={84}
            step={1}
            value={detected.totalSpaces || ""}
            placeholder="e.g. 30"
            onChange={(e) =>
              update({ totalSpaces: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </Field>

        <Field
          label="Open full-size spaces"
          overridden={isOverridden("openFullSpaces")}
          aiValue={
            aiDetected.openFullSpaces
              ? String(aiDetected.openFullSpaces)
              : "Unknown"
          }
        >
          <input
            type="number"
            min={0}
            max={84}
            step={1}
            value={detected.openFullSpaces || ""}
            placeholder="e.g. 4"
            onChange={(e) =>
              update({ openFullSpaces: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </Field>

        <Field
          label="Tandem/quad compatibility"
          overridden={isOverridden("tandemQuadCompatibility")}
          aiValue={aiDetected.tandemQuadCompatibility}
        >
          <select
            value={detected.tandemQuadCompatibility}
            onChange={(e) =>
              update({
                tandemQuadCompatibility: e.target
                  .value as DetectedPanel["tandemQuadCompatibility"],
              })
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            {TANDEM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-2">
          Condition flags
          {isOverridden("conditionFlags") && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
              edited
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {CONDITION_FLAG_OPTIONS.map((flag) => {
            const checked = (detected.conditionFlags || []).some(
              (f) => f.toLowerCase() === flag.toLowerCase(),
            );
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleConditionFlag(flag)}
                className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                  checked
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400"
                }`}
              >
                {checked ? "✓ " : ""}
                {flag}
              </button>
            );
          })}
        </div>
      </div>

      {detected.notes && (
        <p className="text-xs text-zinc-500 italic mt-4">
          AI note: &ldquo;{detected.notes}&rdquo;
        </p>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  overridden: boolean;
  aiValue: string;
  children: React.ReactNode;
}

function Field({ label, overridden, aiValue, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
          {label}
        </label>
        {overridden && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
            edited
          </span>
        )}
      </div>
      {children}
      <div className="text-[10px] text-zinc-400 mt-1">AI read: {aiValue}</div>
    </div>
  );
}
