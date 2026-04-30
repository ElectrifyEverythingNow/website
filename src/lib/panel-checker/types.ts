export type Confidence = "low" | "medium" | "high";
export type TandemQuad = "likely yes" | "likely no" | "unknown";
export type LabelReadable = "yes" | "partial" | "no" | "unknown";

export interface DetectedPanel {
  brand: string;
  modelOrSeries: string;
  mainBreakerAmps: number;
  busRatingAmps: number;
  totalSpaces: number;
  openFullSpaces: number;
  openTwoPoleSpaces: number;
  tandemQuadCompatibility: TandemQuad;
  existingLargeLoads: string[];
  conditionFlags: string[];
  labelReadable: LabelReadable;
  notes: string;
}

export interface PanelAnalysis {
  detected: DetectedPanel;
  overallConfidence: Confidence;
  limitations: string[];
}

export interface SolutionCard {
  title: string;
  cost: string;
  confidence: Confidence;
  why: string;
}

export interface Recommendations {
  spacesNeeded: number;
  largestBreaker: number;
  spacesShort: number;
  conditionConcern: boolean;
  options: SolutionCard[];
}

export interface AnalyzePanelResponse {
  analysis: PanelAnalysis;
  recommendations: Recommendations;
}

export type UpgradeId =
  | "heat-pump"
  | "backup-resistance"
  | "hpwh"
  | "ev"
  | "induction"
  | "dryer";

export interface UpgradeOption {
  id: UpgradeId;
  label: string;
  shortLabel: string;
  amps: number;
  spaces: number;
  note?: string;
  defaultSelected: boolean;
  flexibleLoad: boolean;
}

export const UPGRADES: UpgradeOption[] = [
  {
    id: "heat-pump",
    label: "Heat pump",
    shortLabel: "Heat pump",
    amps: 40,
    spaces: 2,
    defaultSelected: true,
    flexibleLoad: false,
  },
  {
    id: "backup-resistance",
    label: "Backup electric resistance heat kit",
    shortLabel: "Backup heat kit",
    amps: 40,
    spaces: 2,
    note: "Actual heat strip size varies widely.",
    defaultSelected: false,
    flexibleLoad: false,
  },
  {
    id: "hpwh",
    label: "Heat pump water heater",
    shortLabel: "HPWH",
    amps: 30,
    spaces: 2,
    defaultSelected: true,
    flexibleLoad: true,
  },
  {
    id: "ev",
    label: "EV charging",
    shortLabel: "EV charger",
    amps: 50,
    spaces: 2,
    note: "Can often be downsized or load-managed.",
    defaultSelected: false,
    flexibleLoad: true,
  },
  {
    id: "induction",
    label: "Induction stove",
    shortLabel: "Induction stove",
    amps: 50,
    spaces: 2,
    defaultSelected: false,
    flexibleLoad: false,
  },
  {
    id: "dryer",
    label: "Heat pump dryer / laundry",
    shortLabel: "Dryer",
    amps: 30,
    spaces: 2,
    defaultSelected: false,
    flexibleLoad: true,
  },
];

export function getUpgrade(id: UpgradeId): UpgradeOption | undefined {
  return UPGRADES.find((u) => u.id === id);
}
