"use client";

import { useState, useRef, useEffect } from "react";
import { RateInputs, type RateInputValues } from "@/components/rates/RateInputs";
import { RateResults } from "@/components/rates/RateResults";
import { fetchRatePlans } from "@/lib/openei";
import { findBestPlan } from "@/lib/rate-calculator";
import type { ComparisonResult } from "@/lib/rate-calculator";
import { NextSteps } from "@/components/panel-checker/NextSteps";

const DEFAULT_INPUTS: RateInputValues = {
  zipCode: "80302",
  homeSqFt: 2500,
  hasEv: true,
  evMilesPerMonth: 1000,
  hasHeatPump: true,
  hasSolar: true,
  solarSizeKw: 5,
};

export default function RatesPage() {
  const [inputs, setInputs] = useState<RateInputValues>(DEFAULT_INPUTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await fetchRatePlans(inputs.zipCode);

    if ("error" in response) {
      setError(response.error);
      setIsLoading(false);
      return;
    }

    const comparison = findBestPlan(response.plans, {
      homeSqFt: inputs.homeSqFt,
      hasEv: inputs.hasEv,
      evMilesPerMonth: inputs.evMilesPerMonth,
      hasHeatPump: inputs.hasHeatPump,
      hasSolar: inputs.hasSolar,
      solarSizeKw: inputs.solarSizeKw,
    });

    setResult(comparison);
    setIsLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col items-center bg-white">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-green-50 to-white pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Utility Rate Optimizer
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Find the cheapest electricity plan for your electrified home
        </p>
      </section>

      {/* Inputs */}
      <section className="w-full max-w-2xl mx-auto px-4 pb-6">
        <RateInputs values={inputs} onChange={setInputs} onCalculate={handleCalculate} isLoading={isLoading} />
      </section>

      {/* Error */}
      {error && (
        <section className="w-full max-w-2xl mx-auto px-4 pb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section ref={resultsRef} className="w-full max-w-2xl mx-auto px-4 pb-8">
          <RateResults result={result} hasEv={inputs.hasEv} hasSolar={inputs.hasSolar} hasHeatPump={inputs.hasHeatPump} />
        </section>
      )}

      {/* Cross-links + sequencing CTA */}
      <section className="w-full max-w-2xl mx-auto px-4 pb-8">
        <NextSteps current="rates" />
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100 mt-auto">
        <p>
          Rate data from{" "}
          <a href="https://openei.org/wiki/Utility_Rate_Database" target="_blank" rel="noopener noreferrer"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2">
            OpenEI Utility Rate Database
          </a>. Estimates are approximate.
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()}{" "}
          <a href="https://electrifyeverythingnow.com"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2">
            ElectrifyEverythingNow.com
          </a>
        </p>
      </footer>
    </main>
  );
}
