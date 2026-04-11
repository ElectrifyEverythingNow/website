import type { PlanResult } from "@/lib/rate-calculator";

interface PlanComparisonChartProps {
  plans: PlanResult[];
  recommendedName: string;
}

export function PlanComparisonChart({ plans, recommendedName }: PlanComparisonChartProps) {
  if (plans.length === 0) return null;
  const maxCost = Math.max(...plans.map((p) => p.avgMonthlyCost));

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h3 className="text-sm font-bold text-zinc-700 mb-4">Monthly Cost Comparison</h3>
      <div className="space-y-4">
        {plans.map((planResult) => {
          const { plan, avgMonthlyCost, avgBreakdown } = planResult;
          const isRecommended = plan.name === recommendedName;
          const barWidth = maxCost > 0 ? (avgMonthlyCost / maxCost) * 100 : 0;
          const totalPositive = avgBreakdown.byCategory.base + avgBreakdown.byCategory.ev + avgBreakdown.byCategory.heatPump;
          const basePct = totalPositive > 0 ? (avgBreakdown.byCategory.base / totalPositive) * 100 : 100;
          const evPct = totalPositive > 0 ? (avgBreakdown.byCategory.ev / totalPositive) * 100 : 0;
          const hpPct = totalPositive > 0 ? (avgBreakdown.byCategory.heatPump / totalPositive) * 100 : 0;

          return (
            <div key={plan.name}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold ${isRecommended ? "text-green-700" : "text-zinc-600"}`}>
                  {plan.name}
                  {plan.isTOU && (
                    <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">TOU</span>
                  )}
                </span>
                <span className={`text-xs font-bold ${isRecommended ? "text-green-600" : "text-zinc-700"}`}>
                  ${Math.round(avgMonthlyCost)}/mo{isRecommended && " \u2713"}
                </span>
              </div>
              <div className="bg-zinc-100 rounded h-5 overflow-hidden">
                <div className="h-full flex rounded" style={{ width: `${barWidth}%` }}>
                  <div className="bg-purple-400" style={{ width: `${basePct}%` }} title={`Base: $${Math.round(avgBreakdown.byCategory.base)}`} />
                  <div className="bg-blue-400" style={{ width: `${evPct}%` }} title={`EV: $${Math.round(avgBreakdown.byCategory.ev)}`} />
                  <div className="bg-amber-400" style={{ width: `${hpPct}%` }} title={`Heat Pump: $${Math.round(avgBreakdown.byCategory.heatPump)}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-400 rounded-sm inline-block" /> Base Load</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-400 rounded-sm inline-block" /> EV Charging</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" /> Heating/Cooling</span>
      </div>
    </div>
  );
}
