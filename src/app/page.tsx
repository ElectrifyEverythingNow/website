"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { USMap } from "@/components/USMap";
import { UtilityPicker } from "@/components/UtilityPicker";
import { SystemInputs } from "@/components/SystemInputs";
import { ResultsCard } from "@/components/ResultsCard";
import { RefineEstimate } from "@/components/RefineEstimate";
import { QuoteForm } from "@/components/QuoteForm";
import { ShareResults } from "@/components/ShareResults";
import { calculateSolarEstimate } from "@/lib/calculations";
import solarData from "@/data/solar-hours.json";
import type { StateData, Utility, TiltAngle } from "@/lib/types";

export default function Home() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [systemSizeW, setSystemSizeW] = useState(1200);
  const [systemCost, setSystemCost] = useState(2000);
  const [tiltAngle, setTiltAngle] = useState<TiltAngle>(70);
  const [pvwattsKwh, setPvwattsKwh] = useState<number | null>(null);
  const [calcCount, setCalcCount] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch counter on mount
  useEffect(() => {
    fetch("/api/counter")
      .then((r) => r.json())
      .then((d) => setCalcCount(d.count))
      .catch(() => {});
  }, []);

  // Increment counter
  const incrementCounter = useCallback(() => {
    fetch("/api/counter", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setCalcCount(d.count))
      .catch(() => {});
  }, []);

  const ratePerKwh = selectedUtility?.ratePerKwh ?? customRate;
  const stateInfo = selectedState
    ? (solarData as Record<string, StateData>)[selectedState]
    : null;

  const estimate = useMemo(() => {
    if (!stateInfo || ratePerKwh == null || ratePerKwh <= 0) return null;
    if (pvwattsKwh != null) {
      const annualSavings = pvwattsKwh * ratePerKwh;
      const theoreticalMaxKwh = (systemSizeW / 1000) * 8760;
      return {
        annualKwh: pvwattsKwh,
        annualSavings,
        paybackYears: annualSavings === 0 ? Infinity : systemCost / annualSavings,
        tenYearSavings: annualSavings * 10 - systemCost,
        twentyYearSavings: annualSavings * 20 - systemCost,
        capacityFactor: theoreticalMaxKwh > 0 ? pvwattsKwh / theoreticalMaxKwh : 0,
      };
    }
    return calculateSolarEstimate({
      systemSizeW,
      systemCost,
      peakSunHours: stateInfo.peakSunHours,
      ratePerKwh,
      tiltAngle,
    });
  }, [stateInfo, ratePerKwh, systemSizeW, systemCost, tiltAngle, pvwattsKwh]);

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
    incrementCounter();
  };

  const handleSelectUtility = (
    utility: Utility | null,
    rate: number | null
  ) => {
    setSelectedUtility(utility);
    setCustomRate(rate);
    incrementCounter();
  };

  const handleSystemSizeChange = (value: number) => {
    setSystemSizeW(value);
    incrementCounter();
  };

  const handleSystemCostChange = (value: number) => {
    setSystemCost(value);
    incrementCounter();
  };

  const handleTiltAngleChange = (value: TiltAngle) => {
    setTiltAngle(value);
    incrementCounter();
  };

  return (
    <main className="flex flex-1 flex-col items-center bg-white">
      <Header calcCount={calcCount} />

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
              tiltAngle={tiltAngle}
              onSystemSizeChange={handleSystemSizeChange}
              onSystemCostChange={handleSystemCostChange}
              onTiltAngleChange={handleTiltAngleChange}
            />
          </div>
        </section>
      )}

      {estimate && selectedState && (
        <section ref={resultsRef} className="w-full max-w-2xl mx-auto px-4 pb-8">
          <ResultsCard
            estimate={estimate}
            systemSizeW={systemSizeW}
            systemCost={systemCost}
          />
          <div className="mt-4">
            <RefineEstimate
              systemSizeW={systemSizeW}
              onRefine={setPvwattsKwh}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <QuoteForm
              state={selectedState}
              utility={selectedUtility?.name ?? "Custom rate"}
              systemSizeW={systemSizeW}
              systemCost={systemCost}
              estimatedPayback={estimate.paybackYears}
              estimatedAnnualSavings={estimate.annualSavings}
            />
            <ShareResults
              estimate={estimate}
              state={selectedState}
              utility={selectedUtility?.name ?? "Custom rate"}
              systemSizeW={systemSizeW}
              systemCost={systemCost}
            />
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-8 px-4 text-center">
        <p className="text-green-100 text-sm font-medium uppercase tracking-wider mb-2">
          Free &amp; open source
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          See all the tools we&apos;ve built to accelerate the electrification movement
        </h2>
        <p className="text-green-100 max-w-lg mx-auto mb-5">
          Rebate calculators, sizing tools, and more — all free for homeowners and contractors.
        </p>
        <a
          href="https://electrifyeverythingnow.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors shadow-lg"
        >
          Explore ElectrifyEverythingNow.com
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </a>
      </section>

      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100">
        <p>
          Estimates are approximate. Actual production depends on panel orientation,
          shading, and local conditions.
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://electrifyeverythingnow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            ElectrifyEverythingNow.com
          </a>
        </p>
        <p className="mt-1">
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
