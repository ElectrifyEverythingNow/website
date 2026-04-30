import type {
  Confidence,
  PanelAnalysis,
  Recommendations,
  SolutionCard,
  UpgradeId,
} from "./types";
import { UPGRADES, getUpgrade } from "./types";

const OBSOLETE_BRANDS = ["federal pacific", "fpe", "zinsco", "stab-lok"];

const CONDITION_CONCERN_KEYWORDS = [
  "rust",
  "burn",
  "scorch",
  "water",
  "obsolete",
  "double tap",
  "double-tap",
  "missing cover",
];

export function isConditionConcern(
  brand: string,
  conditionFlags: string[],
): boolean {
  const brandLower = (brand || "").toLowerCase();
  if (OBSOLETE_BRANDS.some((b) => brandLower.includes(b))) return true;
  return conditionFlags.some((flag) => {
    const lower = flag.toLowerCase();
    if (lower === "none") return false;
    return CONDITION_CONCERN_KEYWORDS.some((kw) => lower.includes(kw));
  });
}

export function computeRecommendations(
  analysis: PanelAnalysis,
  selectedUpgradeIds: UpgradeId[],
): Recommendations {
  const selected = selectedUpgradeIds
    .map((id) => getUpgrade(id))
    .filter((u): u is NonNullable<ReturnType<typeof getUpgrade>> => Boolean(u));

  const spacesNeeded = selected.reduce((sum, u) => sum + u.spaces, 0);
  const largestBreaker = selected.reduce(
    (max, u) => (u.amps > max ? u.amps : max),
    0,
  );

  const detected = analysis.detected;
  const openFullSpaces = Math.max(0, detected.openFullSpaces || 0);
  const spacesShort = Math.max(0, spacesNeeded - openFullSpaces);

  const conditionConcern = isConditionConcern(
    detected.brand,
    detected.conditionFlags || [],
  );

  const mainAmps = detected.mainBreakerAmps || 0;
  const smallService = mainAmps > 0 && mainAmps <= 125;
  const unknownService = mainAmps === 0;
  const largeService = mainAmps >= 150;

  const flexibleLoadsSelected = selected.some((u) => u.flexibleLoad);
  const evSelected = selected.some((u) => u.id === "ev");
  const hpwhOrDryerSelected = selected.some(
    (u) => u.id === "hpwh" || u.id === "dryer",
  );
  const heatOnlySelected =
    selected.length > 0 &&
    selected.every(
      (u) => u.id === "heat-pump" || u.id === "backup-resistance",
    );

  const imageConfidence = analysis.overallConfidence;

  const options: SolutionCard[] = [];

  // 1. Add the breakers / direct install
  if (!conditionConcern && openFullSpaces >= spacesNeeded && spacesNeeded > 0) {
    options.push({
      title: "Add the breakers (direct install)",
      cost: "$500–$2,500+",
      confidence:
        imageConfidence === "low" ? "low" : ("high" as Confidence),
      why: "Detected open spaces may cover the selected upgrades. Electrician still needs load calculation and equipment specs.",
    });
  }

  // 2. Use tandem or quad breakers
  if (
    !conditionConcern &&
    spacesShort > 0 &&
    detected.tandemQuadCompatibility === "likely yes"
  ) {
    let confidence: Confidence;
    if (spacesShort <= 4 && imageConfidence !== "low") confidence = "high";
    else if (imageConfidence === "low") confidence = "low";
    else confidence = "medium";

    options.push({
      title: "Use tandem or quad breakers",
      cost: "$300–$1,500",
      confidence,
      why: "May free needed spaces without replacing the panel.",
    });
  }

  // 3. Check tandem/quad compatibility
  if (
    !conditionConcern &&
    spacesShort > 0 &&
    (detected.tandemQuadCompatibility === "unknown" ||
      detected.tandemQuadCompatibility === "likely no")
  ) {
    const confidence: Confidence =
      detected.tandemQuadCompatibility === "likely no" ? "low" : "medium";
    options.push({
      title: "Check tandem/quad compatibility",
      cost: "$0–$300 diagnosis; $300–$1,500 if compatible",
      confidence,
      why: "A full panel may be a space problem, not a service-capacity problem. The panel label/model decides.",
    });
  }

  // 4. Simple switch / load sharing
  const wantsLoadShare =
    flexibleLoadsSelected ||
    smallService ||
    (detected.existingLargeLoads || []).length > 0;
  if (!conditionConcern && wantsLoadShare) {
    let confidence: Confidence;
    if (evSelected) confidence = "high";
    else if (hpwhOrDryerSelected) confidence = "medium";
    else if (heatOnlySelected) confidence = "low";
    else confidence = "medium";

    options.push({
      title: "Simple switch / load sharing",
      cost: "$700–$2,500",
      confidence,
      why: "Best for flexible loads like EV charging, and sometimes HPWH/laundry. Lets two large loads avoid running together.",
    });
  }

  // 5. Add a small subpanel
  if (!conditionConcern && spacesShort > 0 && largeService) {
    options.push({
      title: "Add a small subpanel",
      cost: "$1,500–$4,000+",
      confidence: "medium",
      why: "Adds breaker spaces when service has headroom. Does not add service amperage.",
    });
  }

  // 6. Measured load / smart load management
  const wantsMeasuredLoad =
    smallService ||
    unknownService ||
    selected.length >= 3 ||
    largestBreaker >= 50;
  if (!conditionConcern && wantsMeasuredLoad) {
    options.push({
      title: "Measured load / smart load management",
      cost: "$500–$4,000+",
      confidence: imageConfidence === "low" ? "low" : ("medium" as Confidence),
      why: "Multiple upgrades may still fit if actual peak demand is low or flexible loads are managed.",
    });
  }

  // 7. Full panel or service upgrade — always last
  options.push({
    title: "Full panel or service upgrade",
    cost: "$5,000–$15,000+",
    confidence: conditionConcern ? "medium" : ("low" as Confidence),
    why: conditionConcern
      ? "May be justified if the panel is unsafe, damaged, obsolete, or parts are unavailable."
      : "Treat as last resort after spaces, tandems/quads, load sharing, subpanel, and measured load are checked.",
  });

  return {
    spacesNeeded,
    largestBreaker,
    spacesShort,
    conditionConcern,
    options,
  };
}

export function selectedUpgradeSummary(ids: UpgradeId[]): string {
  if (!ids.length) return "no upgrades selected";
  return ids
    .map((id) => {
      const u = getUpgrade(id);
      return u ? u.shortLabel.toLowerCase() : id;
    })
    .join(", ");
}

export function defaultSelectedUpgrades(): UpgradeId[] {
  return UPGRADES.filter((u) => u.defaultSelected).map((u) => u.id);
}
