import type { Confidence } from "@/lib/panel-checker/types";

interface ConfidenceBadgeProps {
  confidence: Confidence;
}

const STYLES: Record<Confidence, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-zinc-100 text-zinc-700",
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STYLES[confidence]}`}
    >
      {confidence} confidence
    </span>
  );
}
