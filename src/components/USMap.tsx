"use client";

import { useState, useCallback, useMemo } from "react";
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
import utilityCounties from "@/data/utility-counties.json";
import type { StateData, LegislationInfo } from "@/lib/types";
import { calculateSolarEstimate, getVerdict } from "@/lib/calculations";

const STATES_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const COUNTIES_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

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
const DEFAULT_TILT = 70 as const;

const countyMap = utilityCounties as Record<string, string>;

interface UtilityPayback {
  name: string;
  ratePerKwh: number;
  paybackYears: number;
}

/** Build a lookup: utility name -> payback color for the map */
function buildUtilityColorMap(): Record<string, string> {
  const colors: Record<string, string> = {};
  const allUtils = utilitiesData as Record<string, { state: string; utilities: { name: string; ratePerKwh: number; customers: number }[] }>;

  for (const [stateCode, stateData] of Object.entries(allUtils)) {
    const solar = (solarData as Record<string, StateData>)[stateCode];
    if (!solar) continue;
    const legis = (legislationData as Record<string, LegislationInfo>)[stateCode];
    const hasLegislation = legis && legis.status !== "none" && legis.status !== "failed";
    const isActive = legis && (legis.status === "enacted" || legis.status === "approved");

    for (const u of stateData.utilities) {
      if (colors[u.name]) continue; // already computed
      const estimate = calculateSolarEstimate({
        systemSizeW: DEFAULT_SYSTEM_W,
        systemCost: DEFAULT_COST,
        peakSunHours: solar.peakSunHours,
        ratePerKwh: u.ratePerKwh,
        tiltAngle: DEFAULT_TILT,
        annualEscalator: 0.03,
      });

      if (!hasLegislation) {
        colors[u.name] = "#d4d4d8"; // zinc-300: no legislation
        continue;
      }

      const verdict = getVerdict(estimate.paybackYears);
      switch (verdict) {
        case "no-brainer":
          colors[u.name] = isActive ? "#22c55e" : "#bbf7d0"; break;
        case "great":
          colors[u.name] = isActive ? "#4ade80" : "#dcfce7"; break;
        case "worth-considering":
          colors[u.name] = isActive ? "#facc15" : "#fef9c3"; break;
        case "tough-roi":
          colors[u.name] = isActive ? "#f87171" : "#fecaca"; break;
      }
    }
  }
  return colors;
}

function getUtilityPaybacks(stateCode: string): UtilityPayback[] {
  const state = (solarData as Record<string, StateData>)[stateCode];
  const stateUtils = (utilitiesData as Record<string, { utilities: { name: string; ratePerKwh: number; customers: number }[] }>)[stateCode];
  if (!state || !stateUtils?.utilities?.length) return [];

  return stateUtils.utilities.map((u) => {
    const estimate = calculateSolarEstimate({
      systemSizeW: DEFAULT_SYSTEM_W,
      systemCost: DEFAULT_COST,
      peakSunHours: state.peakSunHours,
      ratePerKwh: u.ratePerKwh,
      tiltAngle: DEFAULT_TILT,
      annualEscalator: 0.03,
    });
    return { name: u.name, ratePerKwh: u.ratePerKwh, paybackYears: estimate.paybackYears };
  });
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
    utilityPaybacks: UtilityPayback[];
    x: number;
    y: number;
  } | null>(null);

  // Pre-compute: utility name -> fill color
  const utilityColors = useMemo(() => buildUtilityColorMap(), []);

  // Pre-compute utility paybacks for tooltip
  const allUtilityPaybacks = useMemo(() => {
    const map: Record<string, UtilityPayback[]> = {};
    for (const code of Object.values(FIPS_TO_STATE)) {
      map[code] = getUtilityPaybacks(code);
    }
    return map;
  }, []);

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
        utilityPaybacks: allUtilityPaybacks[stateCode] ?? [],
        x: event.clientX,
        y: event.clientY,
      });
    },
    [allUtilityPaybacks]
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
        Click your state to see economics by utility
      </p>
      <ComposableMap
        projection="geoAlbersUsa"
        width={800}
        height={500}
        projectionConfig={{ scale: 1050, translate: [400, 260] }}
      >
        {/* Layer 1: County fills colored by utility economics */}
        <Geographies geography={COUNTIES_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countyFips = geo.id as string;
              const utilityName = countyMap[countyFips];
              const fillColor = utilityName
                ? (utilityColors[utilityName] ?? "#e5e7eb")
                : "#e5e7eb"; // unmapped county: light gray

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#f4f4f5"
                  strokeWidth={0.15}
                  className="pointer-events-none"
                  tabIndex={-1}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Layer 2: State outlines on top — handles all interaction */}
        <Geographies geography={STATES_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateCode = FIPS_TO_STATE[geo.id];
              const isSelected = stateCode === selectedState;
              const stateData = stateCode
                ? (solarData as Record<string, StateData>)[stateCode]
                : null;
              const stateName = stateData?.name ?? "Unknown";
              const legis = stateCode
                ? (legislationData as Record<string, LegislationInfo>)[stateCode]
                : null;
              const ariaText = stateCode
                ? `${stateName} — ${legis?.label ?? "No data"}. ${stateData ? `Peak sun hours: ${stateData.peakSunHours}` : ""}`
                : undefined;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="transparent"
                  stroke={isSelected ? "#1d4ed8" : "#ffffff"}
                  strokeWidth={isSelected ? 2.5 : 1}
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
                      fill: "rgba(96, 165, 250, 0.15)",
                      stroke: "#1d4ed8",
                      strokeWidth: 1.5,
                      outline: "none",
                    },
                    pressed: {
                      fill: "rgba(96, 165, 250, 0.15)",
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
