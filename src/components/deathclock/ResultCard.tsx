import type { AnyResult } from "@/lib/deathclock/types";

const URGENCY_STYLES = {
  critical: {
    card: { background: "#fef2f2", borderColor: "#fca5a5" },
    badge: { color: "#dc2626", background: "#fee2e2" },
    bar: "#ef4444",
    prefix: "☠️ ",
  },
  warning: {
    card: { background: "#fffbeb", borderColor: "#fcd34d" },
    badge: { color: "#d97706", background: "#fef3c7" },
    bar: "#f59e0b",
    prefix: "",
  },
  good: {
    card: { background: "#f0fdf4", borderColor: "#86efac" },
    badge: { color: "#16a34a", background: "#dcfce7" },
    bar: "#22c55e",
    prefix: "",
  },
};

function getBadgeText(yearsRemaining: number): string {
  if (yearsRemaining <= 0) return "Past due — replace now";
  return `~${yearsRemaining} yr${yearsRemaining === 1 ? "" : "s"} left`;
}

function getMetaLine(result: AnyResult): string {
  if ("modelYear" in result) {
    return `${result.modelYear} · ${result.currentMiles.toLocaleString()} mi · Dies at 150K mi or ${result.modelYear + 12}`;
  }
  return `Installed ${result.installYear} · Avg lifespan ${result.minLifespan}–${result.maxLifespan} yrs · Dies ~${result.projectedDeathYear}`;
}

interface Props {
  result: AnyResult;
}

export function ResultCard({ result }: Props) {
  const styles = URGENCY_STYLES[result.urgency];

  return (
    <div
      className="rounded-xl border p-4 mb-3 flex items-center gap-4"
      style={styles.card}
    >
      <div className="text-3xl flex-shrink-0">{result.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{result.name}</span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={styles.badge}
          >
            {styles.prefix}{getBadgeText(result.yearsRemaining)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{getMetaLine(result)}</div>
        <div className="text-xs mt-0.5 text-een-green">
          Upgrade → {result.upgradeTo}
        </div>
        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ background: "#e2e8f0" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${result.lifeConsumedPercent}%`,
              background: styles.bar,
            }}
          />
        </div>
      </div>
    </div>
  );
}
