"use client";

import { useState } from "react";
import { APPLIANCES } from "@/lib/deathclock/appliances";
import { getApplianceResult, getVehicleResult, sortByUrgency } from "@/lib/deathclock/calculations";
import type { ApplianceFormValues, VehicleFormValues, AnyResult } from "@/lib/deathclock/types";
import { ApplianceInput } from "@/components/deathclock/ApplianceInput";
import { VehicleInput } from "@/components/deathclock/VehicleInput";
import { ResultCard } from "@/components/deathclock/ResultCard";

type ApplianceFormState = Record<string, ApplianceFormValues>;

function initialFormState(): ApplianceFormState {
  return Object.fromEntries(
    APPLIANCES.map((a) => [a.id, { installYear: "", skipped: false }])
  );
}

function getSummary(results: AnyResult[]): { critical: number; warning: number; good: number; label: string } {
  const critical = results.filter((r) => r.urgency === "critical").length;
  const warning = results.filter((r) => r.urgency === "warning").length;
  const good = results.filter((r) => r.urgency === "good").length;

  let label: string;
  if (critical >= 2) label = "Multiple appliances are on borrowed time. Start planning now.";
  else if (critical === 1) label = "One appliance needs attention soon. Don't wait for it to fail.";
  else if (warning >= 2) label = "A few appliances are aging. Good time to start researching upgrades.";
  else if (warning === 1) label = "Mostly healthy, but one is getting up there.";
  else label = "Your home is in great shape. No urgent replacements needed.";

  return { critical, warning, good, label };
}

export default function DeathClockPage() {
  const [applianceValues, setApplianceValues] = useState<ApplianceFormState>(initialFormState);
  const [vehicleValues, setVehicleValues] = useState<VehicleFormValues>({
    modelYear: "",
    currentMiles: "",
    skipped: false,
  });
  const [results, setResults] = useState<AnyResult[] | null>(null);

  function handleApplianceChange(id: string, installYear: string) {
    setApplianceValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], installYear },
    }));
  }

  function handleApplianceToggleSkip(id: string) {
    setApplianceValues((prev) => ({
      ...prev,
      [id]: { installYear: "", skipped: !prev[id].skipped },
    }));
  }

  function handleCalculate() {
    const computed: AnyResult[] = [];

    for (const appliance of APPLIANCES) {
      const values = applianceValues[appliance.id];
      if (values.skipped || !values.installYear) continue;
      const year = parseInt(values.installYear, 10);
      if (isNaN(year)) continue;
      computed.push(getApplianceResult(appliance, year));
    }

    if (!vehicleValues.skipped && vehicleValues.modelYear && vehicleValues.currentMiles) {
      const modelYear = parseInt(vehicleValues.modelYear, 10);
      const miles = parseInt(vehicleValues.currentMiles, 10);
      if (!isNaN(modelYear) && !isNaN(miles)) {
        computed.push(getVehicleResult(modelYear, miles));
      }
    }

    setResults(sortByUrgency(computed));

    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  const hasAnyInput = APPLIANCES.some(
    (a) => !applianceValues[a.id].skipped && applianceValues[a.id].installYear
  ) || (!vehicleValues.skipped && vehicleValues.modelYear && vehicleValues.currentMiles);

  const summary = results && results.length > 0 ? getSummary(results) : null;

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      {/* Top banner */}
      <div className="text-center py-2 text-sm text-white" style={{ background: "#0D9448" }}>
        <a href="https://electrifyeverythingnow.com" className="hover:underline">
          ← electrifyeverythingnow.com
        </a>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="text-center pt-10 pb-8">
          <div className="text-5xl mb-3">⏳</div>
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: "var(--font-instrument-serif, 'Georgia', serif)", color: "#1a1a1a" }}
          >
            Appliance Death Clock
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            See when each appliance is likely to fail, so you can plan the electric
            upgrade instead of panicking through an emergency replacement.
          </p>
        </div>

        {/* Input form */}
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-4">
          Enter your appliance ages
        </p>

        {APPLIANCES.map((appliance) => (
          <ApplianceInput
            key={appliance.id}
            appliance={appliance}
            installYear={applianceValues[appliance.id].installYear}
            skipped={applianceValues[appliance.id].skipped}
            onChange={(v) => handleApplianceChange(appliance.id, v)}
            onToggleSkip={() => handleApplianceToggleSkip(appliance.id)}
          />
        ))}

        <VehicleInput
          modelYear={vehicleValues.modelYear}
          currentMiles={vehicleValues.currentMiles}
          skipped={vehicleValues.skipped}
          onModelYearChange={(v) => setVehicleValues((prev) => ({ ...prev, modelYear: v }))}
          onMilesChange={(v) => setVehicleValues((prev) => ({ ...prev, currentMiles: v }))}
          onToggleSkip={() =>
            setVehicleValues((prev) => ({
              modelYear: "",
              currentMiles: "",
              skipped: !prev.skipped,
            }))
          }
        />

        <button
          type="button"
          onClick={handleCalculate}
          disabled={!hasAnyInput}
          className="w-full rounded-xl py-4 text-base font-bold text-white mt-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#16a34a" }}
        >
          ⏳ See Your Death Dates
        </button>

        {/* Results */}
        {results !== null && (
          <div id="results" className="mt-12">
            <hr className="border-dashed mb-10" style={{ borderColor: "#e2e8f0" }} />
            <div className="text-center mb-6">
              <h2
                className="text-2xl"
                style={{ fontFamily: "var(--font-instrument-serif, 'Georgia', serif)", color: "#1a1a1a" }}
              >
                Your Appliance Death Dates
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Sorted by urgency — plan the ones in red first
              </p>
            </div>

            {results.length === 0 ? (
              <p className="text-center text-gray-400 text-sm">
                No appliances entered. Add at least one above.
              </p>
            ) : (
              <>
                {/* Summary card */}
                {summary && (
                  <div className="rounded-xl border p-5 mb-6 text-center" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
                    <div className="flex justify-center gap-4 mb-3">
                      {summary.critical > 0 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#dc2626", background: "#fee2e2" }}>
                          {summary.critical} critical
                        </span>
                      )}
                      {summary.warning > 0 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#d97706", background: "#fef3c7" }}>
                          {summary.warning} aging
                        </span>
                      )}
                      {summary.good > 0 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#16a34a", background: "#dcfce7" }}>
                          {summary.good} healthy
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{summary.label}</p>
                  </div>
                )}

                {results.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Methodology */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: "#e2e8f0" }}>
          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            Lifespan estimates based on data from the National Association of Home Builders (NAHB),
            ASHRAE, and Consumer Reports average appliance lifespan studies. Cost ranges reflect
            national averages from HomeAdvisor and Angi (2024–2025). Rebate amounts from the
            Inflation Reduction Act (IRA) home electrification provisions. Your actual results may
            vary based on usage, maintenance, climate, and local pricing.
          </p>
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            Built by <a href="https://joshlake.ai" className="underline hover:text-gray-600">Josh Lake</a> · <a href="https://electrifyeverythingnow.com" className="underline hover:text-gray-600">ElectrifyEverythingNow</a>
          </p>
        </div>
      </div>
    </div>
  );
}
