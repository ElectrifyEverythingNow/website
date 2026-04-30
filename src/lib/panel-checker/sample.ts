import type { PanelAnalysis, UpgradeId } from "./types";

export const SAMPLE_IMAGE_URL = "/sample-panel.svg";

export const SAMPLE_SELECTED_UPGRADES: UpgradeId[] = [
  "heat-pump",
  "hpwh",
  "ev",
];

export const SAMPLE_ANALYSIS: PanelAnalysis = {
  detected: {
    brand: "Square D",
    modelOrSeries: "QO",
    mainBreakerAmps: 200,
    busRatingAmps: 200,
    totalSpaces: 30,
    openFullSpaces: 8,
    openTwoPoleSpaces: 4,
    tandemQuadCompatibility: "likely yes",
    existingLargeLoads: ["range", "dryer", "AC", "water heater"],
    conditionFlags: ["none"],
    labelReadable: "yes",
    notes: "Sample panel — clean, modern Square D QO with several open slots.",
  },
  overallConfidence: "high",
  limitations: [],
};
