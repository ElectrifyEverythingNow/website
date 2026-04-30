import type { PanelAnalysis, Recommendations } from "./types";

export interface Verdict {
  headline: string;
  detail: string;
  tone: "good" | "caution" | "concern" | "low-confidence";
}

export function getVerdict(
  analysis: PanelAnalysis,
  recommendations: Recommendations,
): Verdict {
  const labelUnreadable =
    analysis.detected.labelReadable === "no" ||
    analysis.detected.labelReadable === "unknown";

  // Low confidence — surface this first so the homeowner doesn't trust a
  // shaky read. Skip if they've already filled in the basics manually.
  const haveBasics =
    (analysis.detected.brand && analysis.detected.brand !== "Unknown") ||
    analysis.detected.mainBreakerAmps > 0 ||
    analysis.detected.totalSpaces > 0;
  if (analysis.overallConfidence === "low" && !haveBasics && labelUnreadable) {
    return {
      headline: "Low confidence — upload a clearer photo",
      detail:
        "We couldn't read enough from this image. Try a clearer shot of the full panel and the inside-door label, or fill in the panel details below manually.",
      tone: "low-confidence",
    };
  }

  if (recommendations.conditionConcern) {
    return {
      headline: "Panel condition may drive replacement",
      detail:
        "Brand or condition flags suggest the panel itself may need attention before adding new loads. Have an electrician inspect before approving any work.",
      tone: "concern",
    };
  }

  if (recommendations.spacesNeeded === 0) {
    return {
      headline: "Pick at least one upgrade to plan around",
      detail:
        "Select what you may add and we'll show you cheaper options to ask an electrician about.",
      tone: "caution",
    };
  }

  if (recommendations.spacesShort === 0) {
    return {
      headline: "You may not need a full panel upgrade",
      detail:
        "There appear to be enough open breaker slots for the upgrades you picked. An electrician still needs to confirm load calculations and equipment specs.",
      tone: "good",
    };
  }

  // spacesShort > 0
  return {
    headline: "This looks like a breaker-space issue",
    detail:
      "More options likely fit if you free up slots with tandem breakers, a small subpanel, or load sharing — before paying for a full panel upgrade.",
    tone: "caution",
  };
}
