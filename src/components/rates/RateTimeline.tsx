import type { ParsedRatePlan } from "@/lib/openei-types";

interface RateTimelineProps {
  plan: ParsedRatePlan;
  hasEv: boolean;
  hasSolar: boolean;
  hasHeatPump: boolean;
}

function getRateColor(rate: number, allRates: number[]): string {
  const min = Math.min(...allRates);
  const max = Math.max(...allRates);
  if (max === min) return "bg-green-200 text-green-800";
  const ratio = (rate - min) / (max - min);
  if (ratio < 0.33) return "bg-green-200 text-green-800";
  if (ratio < 0.66) return "bg-yellow-200 text-yellow-800";
  return "bg-red-200 text-red-800";
}

export function RateTimeline({ plan, hasEv, hasSolar, hasHeatPump }: RateTimelineProps) {
  if (!plan.isTOU) return null;

  const allRates = plan.energyRateStructure.flat().map((t) => t.rate).filter((r) => r > 0);
  const schedule = plan.weekdaySchedule[6] ?? plan.weekdaySchedule[0] ?? Array(24).fill(0);

  // Group consecutive hours with the same period
  const segments: { periodIndex: number; startHour: number; hours: number; rate: number }[] = [];
  let current = { periodIndex: schedule[0], startHour: 0, hours: 1 };

  for (let h = 1; h < 24; h++) {
    if (schedule[h] === current.periodIndex) {
      current.hours++;
    } else {
      const rate = plan.energyRateStructure[current.periodIndex]?.[0]?.rate ?? 0;
      segments.push({ ...current, rate });
      current = { periodIndex: schedule[h], startHour: h, hours: 1 };
    }
  }
  const lastRate = plan.energyRateStructure[current.periodIndex]?.[0]?.rate ?? 0;
  segments.push({ ...current, rate: lastRate });

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h3 className="text-sm font-bold text-zinc-700 mb-1">Why This Plan Saves You Money</h3>
      <p className="text-xs text-zinc-500 mb-3">
        {hasSolar && "Your solar produces during expensive peak hours. "}
        {hasEv && "Your EV charges during cheap off-peak hours. "}
        {hasHeatPump && !hasSolar && !hasEv && "Your heat pump runs throughout the day."}
      </p>
      <div className="flex h-8 rounded overflow-hidden mb-1">
        {segments.map((seg, i) => {
          const colorClass = getRateColor(seg.rate, allRates);
          return (
            <div key={i} className={`flex items-center justify-center text-[9px] font-semibold ${colorClass}`}
              style={{ flex: seg.hours }}
              title={`${seg.startHour}:00-${seg.startHour + seg.hours}:00: $${seg.rate.toFixed(3)}/kWh`}>
              {seg.hours >= 3 && `$${seg.rate.toFixed(2)}`}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-zinc-400 mb-3">
        <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span>
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
        {hasEv && <span>&#9889; EV charges off-peak</span>}
        {hasSolar && <span>&#9728;&#65039; Solar offsets peak</span>}
        {hasHeatPump && <span>&#127777;&#65039; Heat pump runs all day</span>}
      </div>
    </div>
  );
}
