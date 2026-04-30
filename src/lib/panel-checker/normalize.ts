import type {
  Confidence,
  DetectedPanel,
  LabelReadable,
  PanelAnalysis,
  TandemQuad,
} from "./types";

const ALLOWED_TANDEM: TandemQuad[] = ["likely yes", "likely no", "unknown"];
const ALLOWED_LABEL: LabelReadable[] = ["yes", "partial", "no", "unknown"];
const ALLOWED_CONFIDENCE: Confidence[] = ["low", "medium", "high"];

function asString(v: unknown, fallback = "Unknown"): string {
  if (typeof v !== "string") return fallback;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, v);
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).trim())
    .filter((x) => x.length > 0);
}

function asEnum<T extends string>(v: unknown, allowed: T[], fallback: T): T {
  if (typeof v !== "string") return fallback;
  const lower = v.trim().toLowerCase();
  for (const a of allowed) {
    if (a.toLowerCase() === lower) return a;
  }
  return fallback;
}

interface RawDetected {
  brand?: unknown;
  modelOrSeries?: unknown;
  mainBreakerAmps?: unknown;
  busRatingAmps?: unknown;
  totalSpaces?: unknown;
  openFullSpaces?: unknown;
  openTwoPoleSpaces?: unknown;
  tandemQuadCompatibility?: unknown;
  existingLargeLoads?: unknown;
  conditionFlags?: unknown;
  labelReadable?: unknown;
  notes?: unknown;
}

interface RawAnalysis {
  detected?: RawDetected;
  overallConfidence?: unknown;
  limitations?: unknown;
}

export function normalizeAnalysis(raw: unknown): PanelAnalysis {
  const r = (raw && typeof raw === "object" ? raw : {}) as RawAnalysis;
  const d = (r.detected && typeof r.detected === "object"
    ? r.detected
    : {}) as RawDetected;

  const detected: DetectedPanel = {
    brand: asString(d.brand, "Unknown"),
    modelOrSeries: asString(d.modelOrSeries, "Unknown"),
    mainBreakerAmps: asNumber(d.mainBreakerAmps, 0),
    busRatingAmps: asNumber(d.busRatingAmps, 0),
    totalSpaces: asNumber(d.totalSpaces, 0),
    openFullSpaces: asNumber(d.openFullSpaces, 0),
    openTwoPoleSpaces: asNumber(d.openTwoPoleSpaces, 0),
    tandemQuadCompatibility: asEnum<TandemQuad>(
      d.tandemQuadCompatibility,
      ALLOWED_TANDEM,
      "unknown",
    ),
    existingLargeLoads: asStringArray(d.existingLargeLoads),
    conditionFlags: asStringArray(d.conditionFlags),
    labelReadable: asEnum<LabelReadable>(
      d.labelReadable,
      ALLOWED_LABEL,
      "unknown",
    ),
    notes: asString(d.notes, ""),
  };

  return {
    detected,
    overallConfidence: asEnum<Confidence>(
      r.overallConfidence,
      ALLOWED_CONFIDENCE,
      "low",
    ),
    limitations: asStringArray(r.limitations),
  };
}

export function fallbackAnalysis(reason: string): PanelAnalysis {
  return {
    detected: {
      brand: "Unknown",
      modelOrSeries: "Unknown",
      mainBreakerAmps: 0,
      busRatingAmps: 0,
      totalSpaces: 0,
      openFullSpaces: 0,
      openTwoPoleSpaces: 0,
      tandemQuadCompatibility: "unknown",
      existingLargeLoads: [],
      conditionFlags: [],
      labelReadable: "unknown",
      notes: "",
    },
    overallConfidence: "low",
    limitations: [reason],
  };
}
