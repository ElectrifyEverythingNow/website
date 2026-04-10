import type { SolarEstimate } from "@/lib/types";

interface ShareResultsProps {
  estimate: SolarEstimate;
  state: string;
  utility: string;
  systemSizeW: number;
  systemCost: number;
}

export function ShareResults({
  estimate,
  state,
  utility,
  systemSizeW,
  systemCost,
}: ShareResultsProps) {
  const payback =
    estimate.paybackYears === Infinity
      ? "N/A"
      : `${estimate.paybackYears.toFixed(1)} years`;

  const subject = encodeURIComponent(
    `Check this out — balcony solar could pay for itself in ${payback}`
  );

  const body = encodeURIComponent(
    `Hey,

I ran the numbers on plug-in / balcony solar and wanted to share:

State: ${state}
Utility: ${utility}
System: ${systemSizeW}W DC — $${systemCost.toLocaleString()} total

Estimated payback: ${payback}
Annual savings: $${estimate.annualSavings.toFixed(0)}/yr
Annual production: ${estimate.annualKwh.toFixed(0)} kWh/yr
10-year net savings: $${estimate.tenYearSavings.toFixed(0)}
20-year net savings: $${estimate.twentyYearSavings.toFixed(0)}

Try it yourself: https://solar.electrifyeverythingnow.com

— Sent from the Balcony Solar Calculator by ElectrifyEverythingNow.com
`
  );

  const mailto = `mailto:?subject=${subject}&body=${body}`;

  return (
    <a
      href={mailto}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors w-full justify-center"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
      </svg>
      Email My Results to Someone
    </a>
  );
}
