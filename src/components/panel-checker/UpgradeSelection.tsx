"use client";

import { UPGRADES, type UpgradeId } from "@/lib/panel-checker/types";

interface UpgradeSelectionProps {
  selected: UpgradeId[];
  onChange: (selected: UpgradeId[]) => void;
}

const STARTER_BUNDLE: UpgradeId[] = ["heat-pump", "hpwh", "ev"];

export function UpgradeSelection({ selected, onChange }: UpgradeSelectionProps) {
  function toggle(id: UpgradeId) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  function selectStarterBundle() {
    onChange(STARTER_BUNDLE);
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
        className={`mt-3 w-full text-left rounded-lg border px-3 py-3 transition-colors ${
          isStarterBundle
            ? "border-green-600 bg-green-50"
            : "border-dashed border-zinc-300 bg-white hover:border-green-500 hover:bg-green-50/50"
        }`}
      >
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5" aria-hidden>
            🤷
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-zinc-900">
              I&rsquo;m not sure yet — pick a starter bundle
            </div>
            <div className="text-xs text-zinc-600 mt-0.5">
              Common electrification path: <strong>heat pump</strong> +{" "}
              <strong>heat pump water heater</strong> +{" "}
              <strong>EV charger</strong>.
            </div>
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
              }`}
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
