"use client";

import { useEffect, useRef, useState } from "react";
import { UPGRADES, getUpgrade, type UpgradeId } from "@/lib/panel-checker/types";

interface UpgradeSelectionProps {
  selected: UpgradeId[];
  onChange: (selected: UpgradeId[]) => void;
}

const STARTER_BUNDLE: UpgradeId[] = ["heat-pump", "hpwh", "ev"];

export function UpgradeSelection({ selected, onChange }: UpgradeSelectionProps) {
  const [pulseIds, setPulseIds] = useState<Set<UpgradeId>>(() => new Set());
  const pulseTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    };
  }, []);

  function toggle(id: UpgradeId) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  function selectStarterBundle() {
    onChange(STARTER_BUNDLE);
    setPulseIds(new Set(STARTER_BUNDLE));
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseIds(new Set()), 1400);
  }

  const isStarterBundle =
    selected.length === STARTER_BUNDLE.length &&
    STARTER_BUNDLE.every((id) => selected.includes(id));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Step 2 — Pick what you may add
      </h2>
      <p className="text-sm text-zinc-600 mt-2">
        Select any upgrades you might add. Multiple is fine.
      </p>

      {/* "I'm not sure yet" bundle */}
      <button
        type="button"
        onClick={selectStarterBundle}
        aria-pressed={isStarterBundle}
        className={`mt-3 w-full text-left rounded-lg border px-3 py-3 transition-colors ${
          isStarterBundle
            ? "border-green-600 bg-green-50"
            : "border-dashed border-zinc-300 bg-white hover:border-green-500 hover:bg-green-50/50"
        }`}
      >
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5" aria-hidden>
            {isStarterBundle ? "✅" : "🤷"}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-semibold text-zinc-900">
                {isStarterBundle
                  ? "Starter bundle selected"
                  : "I’m not sure yet — pick a starter bundle"}
              </div>
              {isStarterBundle && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded-full">
                  3 selected
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-600 mt-0.5">
              Common electrification path:{" "}
              <strong>heat pump</strong> +{" "}
              <strong>heat pump water heater</strong> +{" "}
              <strong>EV charger</strong>.
            </div>
            {isStarterBundle && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STARTER_BUNDLE.map((id) => {
                  const u = getUpgrade(id);
                  if (!u) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-green-600 text-white px-2 py-0.5"
                    >
                      <span aria-hidden>✓</span>
                      {u.shortLabel}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </button>

      <div
        role="group"
        aria-label="Possible electrification upgrades"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3"
      >
        {UPGRADES.map((u) => {
          const isOn = selected.includes(u.id);
          const pulsing = pulseIds.has(u.id);
          return (
            <button
              key={u.id}
              type="button"
              role="checkbox"
              aria-checked={isOn}
              aria-label={`${u.label}${isOn ? " (selected)" : ""}`}
              onClick={() => toggle(u.id)}
              className={`text-left rounded-lg border px-3 py-3 transition-colors ${
                isOn
                  ? "border-green-600 bg-green-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              } ${pulsing ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex w-4 h-4 rounded border items-center justify-center text-[10px] shrink-0 ${
                    isOn
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {isOn ? "✓" : ""}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-zinc-900">{u.label}</div>
                  <div className="text-xs text-zinc-600 mt-1 space-y-0.5">
                    <div>Typical breaker: {u.amps} amps</div>
                    <div>
                      Usually uses {u.spaces} breaker slot{u.spaces === 1 ? "" : "s"}
                    </div>
                  </div>
                  {u.note && (
                    <div className="text-xs text-zinc-500 italic mt-1.5">{u.note}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500 mt-3 italic">
        Actual breaker size, slot count, and wire size may differ depending on
        the specific equipment, manufacturer specs, and local code. Use these
        as planning estimates only.
      </p>
    </div>
  );
}
