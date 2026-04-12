interface UtilityPayback {
  name: string;
  ratePerKwh: number;
  paybackYears: number;
}

interface StateTooltipProps {
  name: string;
  peakSunHours: number;
  legislationLabel: string;
  legislationStatus: string;
  utilityPaybacks: UtilityPayback[];
  x: number;
  y: number;
}

function getStatusDot(status: string): string {
  switch (status) {
    case "enacted": return "bg-green-500";
    case "approved": return "bg-green-400";
    case "introduced": return "bg-yellow-400";
    case "failed": return "bg-red-400";
    default: return "bg-zinc-400";
  }
}

function getPaybackColor(years: number): string {
  if (years < 4) return "text-green-400";
  if (years < 8) return "text-green-300";
  if (years < 12) return "text-yellow-300";
  return "text-red-300";
}

export function StateTooltip({
  name,
  peakSunHours,
  legislationLabel,
  legislationStatus,
  utilityPaybacks,
  x,
  y,
}: StateTooltipProps) {
  const validPaybacks = utilityPaybacks.filter(
    (u) => u.paybackYears > 0 && isFinite(u.paybackYears)
  );
  const sorted = [...validPaybacks].sort(
    (a, b) => a.paybackYears - b.paybackYears
  );

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg max-w-xs"
      style={{ left: x + 12, top: y - 10 }}
    >
      <p className="font-semibold">{name}</p>
      <p className="text-zinc-300">~{peakSunHours} peak sun hours/day</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`inline-block w-2 h-2 rounded-full ${getStatusDot(legislationStatus)}`} />
        <p className="text-zinc-300 text-xs">{legislationLabel}</p>
      </div>
      {sorted.length > 0 && (
        <div className="mt-1.5 border-t border-zinc-700 pt-1.5">
          <p className="text-zinc-400 text-xs font-medium mb-1">
            Payback by utility:
          </p>
          {sorted.map((u) => (
            <div key={u.name} className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-zinc-300 truncate max-w-[160px]">{u.name}</span>
              <span className={`font-medium whitespace-nowrap ${getPaybackColor(u.paybackYears)}`}>
                {u.paybackYears.toFixed(1)} yr
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
