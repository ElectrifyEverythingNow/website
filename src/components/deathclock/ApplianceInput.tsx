import type { ApplianceDefinition } from "@/lib/deathclock/types";

interface Props {
  appliance: ApplianceDefinition;
  installYear: string;
  skipped: boolean;
  onChange: (installYear: string) => void;
  onToggleSkip: () => void;
}

export function ApplianceInput({ appliance, installYear, skipped, onChange, onToggleSkip }: Props) {
  return (
    <div className={`rounded-xl border p-4 mb-3 flex items-start gap-4 transition-opacity ${skipped ? "opacity-40" : ""}`}
      style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
      <div className="text-3xl flex-shrink-0 mt-0.5">{appliance.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold text-gray-900">{appliance.name}</div>
          <div className="text-[11px] text-gray-400">
            Avg life: {appliance.minLifespan}–{appliance.maxLifespan} yrs
          </div>
        </div>
        <div className="text-xs mb-2 text-een-green">→ {appliance.upgradeTo}</div>
        {!skipped && (
          <input
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            value={installYear}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Year installed (e.g. 2012)"
            className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2"
            style={{ borderColor: "#cbd5e1", "--tw-ring-color": "#16a34a" } as React.CSSProperties}
          />
        )}
        <button
          type="button"
          onClick={onToggleSkip}
          className="text-xs text-gray-400 hover:text-gray-600 mt-1.5 block"
        >
          {skipped ? "I have one — add it" : "I don't have one"}
        </button>
      </div>
    </div>
  );
}
