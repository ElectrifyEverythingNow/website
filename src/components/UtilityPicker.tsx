"use client";

import { useState } from "react";
import utilitiesData from "@/data/utilities.json";
import type { StateUtilities, Utility } from "@/lib/types";

interface UtilityPickerProps {
  stateCode: string;
  onSelectUtility: (utility: Utility | null, customRate: number | null) => void;
}

export function UtilityPicker({
  stateCode,
  onSelectUtility,
}: UtilityPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState<string>("");
  const [overrideRate, setOverrideRate] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);

  const stateData = (utilitiesData as Record<string, StateUtilities>)[
    stateCode
  ];
  if (!stateData) return null;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedIndex(value);
    setOverrideRate("");
    setIsOverriding(false);

    if (value === "custom") {
      setIsOverriding(true);
      onSelectUtility(null, null);
    } else {
      const utility = stateData.utilities[Number(value)];
      if (utility) onSelectUtility(utility, null);
    }
  };

  const handleOverrideToggle = () => {
    setIsOverriding(true);
    setOverrideRate("");
    onSelectUtility(null, null);
  };

  const handleOverrideRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOverrideRate(val);
    const rate = parseFloat(val);
    if (!isNaN(rate) && rate > 0) {
      onSelectUtility(null, rate);
    }
  };

  const handleCancelOverride = () => {
    setIsOverriding(false);
    setOverrideRate("");
    // Re-select the utility if one was picked
    if (selectedIndex && selectedIndex !== "custom") {
      const utility = stateData.utilities[Number(selectedIndex)];
      if (utility) onSelectUtility(utility, null);
    }
  };

  return (
    <div>
      <label
        htmlFor="utility-select"
        className="block text-sm font-medium text-zinc-700 mb-1"
      >
        Your Utility in {stateData.state}
      </label>
      <select
        id="utility-select"
        onChange={handleSelect}
        value={selectedIndex}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="" disabled>
          Select your utility...
        </option>
        {stateData.utilities.map((u, i) => (
          <option key={u.name} value={i}>
            {u.name} — ${u.ratePerKwh.toFixed(3)}/kWh
          </option>
        ))}
        <option value="custom">I know my exact rate</option>
      </select>

      {/* Show override option after selecting a utility */}
      {selectedIndex && selectedIndex !== "custom" && !isOverriding && (
        <button
          onClick={handleOverrideToggle}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
        >
          I know my exact rate — enter it manually
        </button>
      )}

      {isOverriding && (
        <div className="mt-3">
          <label
            htmlFor="custom-rate"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Your electricity rate ($/kWh)
          </label>
          <div className="flex gap-2">
            <input
              id="custom-rate"
              type="number"
              min={0.01}
              max={1.0}
              step={0.001}
              value={overrideRate}
              onChange={handleOverrideRate}
              placeholder="e.g. 0.158"
              autoFocus
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            {selectedIndex !== "custom" && (
              <button
                onClick={handleCancelOverride}
                className="text-sm text-zinc-500 hover:text-zinc-700 px-2"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Check your electric bill for the per-kWh rate
          </p>
        </div>
      )}
    </div>
  );
}
