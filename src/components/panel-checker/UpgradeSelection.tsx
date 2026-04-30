"use client";

import { UPGRADES, type UpgradeId } from "@/lib/panel-checker/types";

interface UpgradeSelectionProps {
  selected: UpgradeId[];
  onChange: (selected: UpgradeId[]) => void;
}

export function UpgradeSelection({ selected, onChange }: UpgradeSelectionProps) {
  function toggle(id: UpgradeId) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Step 2 — Pick what you may add
      </h2>
      <p className="text-sm text-zinc-600 mt-2">
        Select any upgrades you might add. Multiple is fine.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {UPGRADES.map((u) => {
          const isOn = selected.includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u.id)}
              className={`text-left rounded-lg border px-3 py-3 transition-colors ${
                isOn
                  ? "border-green-600 bg-green-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex w-4 h-4 rounded border items-center justify-center text-[10px] ${
                    isOn
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-zinc-300 text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-zinc-900">{u.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    240V · {u.amps}A · {u.spaces} spaces
                  </div>
                  {u.note && (
                    <div className="text-xs text-zinc-500 italic mt-1">{u.note}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
