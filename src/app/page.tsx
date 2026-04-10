"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { USMap } from "@/components/USMap";
import { UtilityPicker } from "@/components/UtilityPicker";
import { SystemInputs } from "@/components/SystemInputs";
import { ResultsCard } from "@/components/ResultsCard";
import { RefineEstimate } from "@/components/RefineEstimate";
import { QuoteForm } from "@/components/QuoteForm";
import { calculateSolarEstimate } from "@/lib/calculations";
import solarData from "@/data/solar-hours.json";
import type { StateData, Utility } from "@/lib/types";

export default function Home() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [systemSizeW, setSystemSizeW] = useState(1200);
  const [systemCost, setSystemCost] = useState(2000);
  const [pvwattsKwh, setPvwattsKwh] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const ratePerKwh = selectedUtility?.ratePerKwh ?? customRate;
  const stateInfo = selectedState
    ? (solarData as Record<string, StateData>)[selectedState]
    : null;

  const estimate = useMemo(() => {
    if (!stateInfo || ratePerKwh == null || ratePerKwh <= 0) return null;
    if (pvwattsKwh != null) {
      const annualSavings = pvwattsKwh * ratePerKwh;
      return {
        annualKwh: pvwattsKwh,
        annualSavings,
        paybackYears: annualSavings === 0 ? Infinity : systemCost / annualSavings,
        tenYearSavings: annualSavings * 10 - systemCost,
        twentyYearSavings: annualSavings * 20 - systemCost,
      };
    }
    return calculateSolarEstimate({
      systemSizeW,
      systemCost,
      peakSunHours: stateInfo.peakSunHours,
      ratePerKwh,
    });
  }, [stateInfo, ratePerKwh, systemSizeW, systemCost, pvwattsKwh]);

  useEffect(() => {
    if (estimate && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [estimate]);

  const handleSelectState = (code: string) => {
    setSelectedState(code);
    setSelectedUtility(null);
    setCustomRate(null);
    setPvwattsKwh(null);
  };

  const handleSelectUtility = (
    utility: Utility | null,
    rate: number | null
  ) => {
    setSelectedUtility(utility);
    setCustomRate(rate);
  };

  return (
    <main className="flex flex-1 flex-col items-center bg-white">
      <Header />

      <section className="w-full py-2">
        <USMap
          selectedState={selectedState}
          onSelectState={handleSelectState}
        />
      </section>

      {selectedState && (
        <section className="w-full max-w-2xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
            <UtilityPicker
              stateCode={selectedState}
              onSelectUtility={handleSelectUtility}
            />
            <SystemInputs
              systemSizeW={systemSizeW}
              systemCost={systemCost}
              onSystemSizeChange={setSystemSizeW}
              onSystemCostChange={setSystemCost}
            />
          </div>
        </section>
      )}

      {estimate && selectedState && (
        <section ref={resultsRef} className="w-full max-w-2xl mx-auto px-4 pb-8">
          <ResultsCard estimate={estimate} />
          <div className="mt-4">
            <RefineEstimate
              systemSizeW={systemSizeW}
              onRefine={setPvwattsKwh}
            />
          </div>
          <div className="mt-4">
            <QuoteForm
              state={selectedState}
              utility={selectedUtility?.name ?? "Custom rate"}
              systemSizeW={systemSizeW}
              systemCost={systemCost}
              estimatedPayback={estimate.paybackYears}
              estimatedAnnualSavings={estimate.annualSavings}
            />
          </div>
        </section>
      )}

      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100 mt-auto">
        <p>
          Estimates are approximate. Actual production depends on panel orientation,
          shading, and local conditions.
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} ElectrifyEverythingNow.com
        </p>
        <p className="mt-2">
          Built by{" "}
          <a
            href="https://joshlake.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400 underline underline-offset-2"
          >
            Josh Lake
          </a>
        </p>
      </footer>
    </main>
  );
}
