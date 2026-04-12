"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { USMap } from "@/components/USMap";
import { UtilityPicker } from "@/components/UtilityPicker";
import { SystemInputs } from "@/components/SystemInputs";
import { ResultsCard } from "@/components/ResultsCard";
import { RefineEstimate } from "@/components/RefineEstimate";
import { QuoteForm } from "@/components/QuoteForm";
import { ShareResults } from "@/components/ShareResults";
import { LegislationSection } from "@/components/LegislationSection";
import { EducationalContent } from "@/components/EducationalContent";
import { calculateSolarEstimate } from "@/lib/calculations";
import solarData from "@/data/solar-hours.json";
import type { StateData, Utility, TiltAngle } from "@/lib/types";

export default function Home() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [systemSizeW, setSystemSizeW] = useState(1200);
  const [systemCost, setSystemCost] = useState(2000);
  const [tiltAngle, setTiltAngle] = useState<TiltAngle>(30);
  const [annualEscalator, setAnnualEscalator] = useState(0.03);
  const [pvwattsKwh, setPvwattsKwh] = useState<number | null>(null);
  const [calcCount, setCalcCount] = useState<number | null>(null);


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
      const annualSavingsYr1 = pvwattsKwh * ratePerKwh;
      const theoreticalMaxKwh = (systemSizeW / 1000) * 8760;
      // Apply escalator to multi-year savings
      let tenYrTotal = 0;
      let twentyYrTotal = 0;
      let payback = Infinity;
      let cumulative = 0;
      for (let y = 0; y < 20; y++) {
        const yrSavings = pvwattsKwh * ratePerKwh * Math.pow(1 + annualEscalator, y);
        cumulative += yrSavings;
        if (payback === Infinity && cumulative >= systemCost) {
          const prev = cumulative - yrSavings;
          payback = y + (systemCost - prev) / yrSavings;
        }
        if (y < 10) tenYrTotal = cumulative;
        if (y < 20) twentyYrTotal = cumulative;
      }
      return {
        annualKwh: pvwattsKwh,
        annualSavings: annualSavingsYr1,
        paybackYears: annualSavingsYr1 === 0 ? Infinity : payback,
        tenYearSavings: tenYrTotal - systemCost,
        twentyYearSavings: twentyYrTotal - systemCost,
        capacityFactor: theoreticalMaxKwh > 0 ? pvwattsKwh / theoreticalMaxKwh : 0,
      };
    }
    return calculateSolarEstimate({
      systemSizeW,
      systemCost,
      peakSunHours: stateInfo.peakSunHours,
      ratePerKwh,
      tiltAngle,
      annualEscalator,
    });
  }, [stateInfo, ratePerKwh, systemSizeW, systemCost, tiltAngle, annualEscalator, pvwattsKwh]);

  // No auto-scroll — user scrolls to results themselves

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

  const handleEscalatorChange = (value: number) => {
    setAnnualEscalator(value);
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
              annualEscalator={annualEscalator}
              onSystemSizeChange={handleSystemSizeChange}
              onSystemCostChange={handleSystemCostChange}
              onTiltAngleChange={handleTiltAngleChange}
              onEscalatorChange={handleEscalatorChange}
            />
          </div>
        </section>
      )}

      {estimate && selectedState && (
        <section className="w-full max-w-2xl mx-auto px-4 pb-8">
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

      <LegislationSection />

      <EducationalContent />

      {/* CTA banner with cross-links */}
      <section className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-8 px-4 text-center">
        <p className="text-green-100 text-sm font-medium uppercase tracking-wider mb-2">
          Free &amp; open source
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          More Free Electrification Tools
        </h2>
        <p className="text-green-100 max-w-lg mx-auto mb-5">
          Rebate calculators, heat pump sizing tools, and more — all free for homeowners.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors shadow-lg"
          >
            Explore All Tools
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </a>
          <a
            href="/rates"
            className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
          >
            Electricity Rate Comparison
          </a>
        </div>
      </section>

      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100">
        <p>
          Estimates are approximate. Actual production depends on panel orientation,
          shading, and local conditions.
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <a
            href="/"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            ElectrifyEverythingNow.com
          </a>
          <span className="text-zinc-300">|</span>
          <a
            href="/rates"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            Rate Comparison
          </a>
          <span className="text-zinc-300">|</span>
          <a
            href="https://solarrights.org/plug-in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            Solar Rights Alliance
          </a>
          <span className="text-zinc-300">|</span>
          <a
            href="https://pvwatts.nrel.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            NREL PVWatts
          </a>
        </nav>
        <p className="mt-2">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="/"
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
