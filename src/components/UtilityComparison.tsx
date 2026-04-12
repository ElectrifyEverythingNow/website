"use client";

import { useState, useMemo } from "react";
import solarData from "@/data/solar-hours.json";
import utilitiesData from "@/data/utilities.json";
import type { StateData, StateUtilities, TiltAngle } from "@/lib/types";
import { calculateSolarEstimate, getVerdict, getVerdictInfo } from "@/lib/calculations";

interface UtilityComparisonProps {
  stateCode: string;
  systemSizeW: number;
  systemCost: number;
  tiltAngle: TiltAngle;
  annualEscalator: number;
  selectedUtilityName: string | null;
  onSelectUtility: (utilityIndex: number) => void;
  onCustomRate: (rate: number | null) => void;
}

export function UtilityComparison({
  stateCode,
  systemSizeW,
  systemCost,
  tiltAngle,
  annualEscalator,
  selectedUtilityName,
  onSelectUtility,
  onCustomRate,
}: UtilityComparisonProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customRateInput, setCustomRateInput] = useState("");
  const stateInfo = (solarData as Record<string, StateData>)[stateCode];
  const stateUtils = (utilitiesData as Record<string, StateUtilities>)[stateCode];

  const utilityEstimates = useMemo(() => {
    if (!stateInfo || !stateUtils?.utilities?.length) return [];

    return stateUtils.utilities.map((u, index) => {
      const estimate = calculateSolarEstimate({
        systemSizeW,
        systemCost,
        peakSunHours: stateInfo.peakSunHours,
        ratePerKwh: u.ratePerKwh,
        tiltAngle,
        annualEscalator,
      });
      const verdict = getVerdict(estimate.paybackYears);
      const verdictInfo = getVerdictInfo(verdict);
      return { ...u, estimate, verdictInfo, index };
    });
  }, [stateInfo, stateUtils, systemSizeW, systemCost, tiltAngle, annualEscalator]);

  if (!utilityEstimates.length) return null;

  // Sort by payback years (best first)
  const sorted = [...utilityEstimates].sort(
    (a, b) => a.estimate.paybackYears - b.estimate.paybackYears
  );

  // Find the max payback to scale the bars
  const maxPayback = Math.max(...sorted.map((u) => u.estimate.paybackYears));
  const barMax = Math.min(maxPayback, 20); // Cap visual at 20 years

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 mb-3">
        Economics by Utility in {stateUtils.state}
      </h3>
      <div className="space-y-2">
        {sorted.map((u) => {
          const isSelected = u.name === selectedUtilityName;
          const barWidth = Math.min((u.estimate.paybackYears / barMax) * 100, 100);

          const barColor =
            u.estimate.paybackYears < 4
              ? "bg-green-500"
              : u.estimate.paybackYears < 8
                ? "bg-green-400"
                : u.estimate.paybackYears < 12
                  ? "bg-yellow-400"
                  : "bg-red-400";

          return (
            <button
              key={u.name}
              onClick={() => onSelectUtility(u.index)}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-zinc-800 truncate">
                  {u.name}
                </span>
                <span className="text-xs text-zinc-500 whitespace-nowrap">
                  ${u.ratePerKwh.toFixed(3)}/kWh
                  <span className="text-zinc-300 mx-1">·</span>
                  {(u.customers / 1000).toFixed(0)}k customers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ${u.verdictInfo.color}`}>
                  {u.estimate.paybackYears < 100
                    ? `${u.estimate.paybackYears.toFixed(1)} yr`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs font-medium ${u.verdictInfo.color}`}>
                  {u.verdictInfo.label}
                </span>
                <span className="text-xs text-zinc-400">
                  ${u.estimate.annualSavings.toFixed(0)}/yr savings
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom rate option */}
      {!isCustom ? (
        <button
          onClick={() => {
            setIsCustom(true);
            onCustomRate(null);
          }}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
        >
          I know my exact rate — enter it manually
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <label htmlFor="custom-rate" className="block text-sm font-medium text-zinc-700 mb-1">
            Your electricity rate ($/kWh)
          </label>
          <div className="flex gap-2">
            <input
              id="custom-rate"
              type="number"
              min={0.01}
              max={1.0}
              step={0.001}
              value={customRateInput}
              onChange={(e) => {
                setCustomRateInput(e.target.value);
                const rate = parseFloat(e.target.value);
                onCustomRate(!isNaN(rate) && rate > 0 ? rate : null);
              }}
              placeholder="e.g. 0.158"
              autoFocus
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={() => {
                setIsCustom(false);
                setCustomRateInput("");
                onCustomRate(null);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-700 px-2"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Check your electric bill for the per-kWh rate
          </p>
        </div>
      )}

      <p className="text-xs text-zinc-400 mt-2 text-center">
        Click a utility to see detailed economics below
      </p>
    </div>
  );
}
