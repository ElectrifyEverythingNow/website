"use client";

import { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { StateTooltip } from "./StateTooltip";
import { ColorLegend } from "./ColorLegend";
import solarData from "@/data/solar-hours.json";
import legislationData from "@/data/legislation.json";
import utilitiesData from "@/data/utilities.json";
import type { StateData, LegislationInfo, Utility } from "@/lib/types";
import { calculateSolarEstimate, getVerdict } from "@/lib/calculations";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY",
};

// Default assumptions for map coloring
const DEFAULT_SYSTEM_W = 1200;
const DEFAULT_COST = 2000;
const DEFAULT_TILT = 30 as const;
const DEFAULT_ESCALATOR = 0.03;

function getDefaultPayback(stateCode: string): number | null {
  const state = (solarData as Record<string, StateData>)[stateCode];
  const stateUtils = (utilitiesData as Record<string, { utilities: { name: string; ratePerKwh: number; customers: number }[] }>)[stateCode];
  if (!state || !stateUtils?.utilities?.length) return null;
  // Use the highest-customer-count utility as default rate
  const topUtility = stateUtils.utilities.reduce((a, b) => a.customers > b.customers ? a : b);
  const estimate = calculateSolarEstimate({
    systemSizeW: DEFAULT_SYSTEM_W,
    systemCost: DEFAULT_COST,
    peakSunHours: state.peakSunHours,
    ratePerKwh: topUtility.ratePerKwh,
    tiltAngle: DEFAULT_TILT,
    annualEscalator: DEFAULT_ESCALATOR,
  });
  return estimate.paybackYears;
}

function getStateColor(stateCode: string): string {
  const legis = (legislationData as Record<string, LegislationInfo>)[stateCode];
  if (!legis) return "#e5e7eb";

  // Gray out states with no legislation or failed bills
  if (legis.status === "none" || legis.status === "failed") {
    return "#d4d4d8"; // zinc-300
  }

  const payback = getDefaultPayback(stateCode);
  if (payback == null) return "#d4d4d8";

  // For states with legislation: color by ROI
  const verdict = getVerdict(payback);

  // Enacted/approved states get full saturation; introduced states get lighter
  const isActive = legis.status === "enacted" || legis.status === "approved";

  switch (verdict) {
    case "no-brainer":
      return isActive ? "#22c55e" : "#bbf7d0"; // green-500 / green-200
    case "great":
      return isActive ? "#4ade80" : "#dcfce7"; // green-400 / green-100
    case "worth-considering":
      return isActive ? "#facc15" : "#fef9c3"; // yellow-400 / yellow-100
    case "tough-roi":
      return isActive ? "#f87171" : "#fecaca"; // red-400 / red-200
  }
}

function getHoverColor(stateCode: string): string {
  const legis = (legislationData as Record<string, LegislationInfo>)[stateCode];
  if (!legis || legis.status === "none" || legis.status === "failed") {
    return "#a1a1aa"; // zinc-400
  }
  return "#60a5fa"; // blue-400
}

interface USMapProps {
  selectedState: string | null;
  onSelectState: (stateCode: string) => void;
}

export function USMap({ selectedState, onSelectState }: USMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    peakSunHours: number;
    legislationLabel: string;
    legislationStatus: string;
    paybackYears: number | null;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseEnter = useCallback(
    (geo: { id: string }, event: React.MouseEvent) => {
      const stateCode = FIPS_TO_STATE[geo.id];
      if (!stateCode) return;
      const data = (solarData as Record<string, StateData>)[stateCode];
      const legis = (legislationData as Record<string, LegislationInfo>)[stateCode];
      if (!data) return;
      setTooltip({
        name: data.name,
        peakSunHours: data.peakSunHours,
        legislationLabel: legis?.label ?? "Unknown",
        legislationStatus: legis?.status ?? "none",
        paybackYears: getDefaultPayback(stateCode),
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip((prev) =>
      prev ? { ...prev, x: event.clientX, y: event.clientY } : null
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4" role="region" aria-label="Interactive U.S. map — select a state to estimate balcony solar savings">
      <p className="text-center text-sm text-zinc-500 mb-2">
        Click your state to get started
      </p>
      <ComposableMap
        projection="geoAlbersUsa"
        width={800}
        height={500}
        projectionConfig={{ scale: 1050, translate: [400, 260] }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateCode = FIPS_TO_STATE[geo.id];
              const isSelected = stateCode === selectedState;
              const fillColor = stateCode
                ? getStateColor(stateCode)
                : "#e5e7eb";
              const hoverFill = stateCode
                ? getHoverColor(stateCode)
                : "#d1d5db";

              const stateDataForA11y = stateCode
                ? (solarData as Record<string, StateData>)[stateCode]
                : null;
              const stateName = stateDataForA11y?.name ?? "Unknown";
              const legisForA11y = stateCode
                ? (legislationData as Record<string, LegislationInfo>)[stateCode]
                : null;
              const ariaText = stateCode
                ? `${stateName} — ${legisForA11y?.label ?? "No data"}. ${stateDataForA11y ? `Peak sun hours: ${stateDataForA11y.peakSunHours}` : ""}`
                : undefined;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke={isSelected ? "#1d4ed8" : "#ffffff"}
                  strokeWidth={isSelected ? 2 : 0.5}
                  className="cursor-pointer outline-none"
                  tabIndex={stateCode ? 0 : -1}
                  role="button"
                  aria-label={ariaText}
                  onMouseEnter={(e) => handleMouseEnter(geo, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (stateCode) onSelectState(stateCode);
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (stateCode && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelectState(stateCode);
                    }
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: hoverFill,
                      stroke: "#1d4ed8",
                      strokeWidth: 1.5,
                      outline: "none",
                    },
                    pressed: {
                      fill: hoverFill,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div className="flex justify-center">
        <ColorLegend />
      </div>
      {tooltip && <StateTooltip {...tooltip} />}
    </div>
  );
}
