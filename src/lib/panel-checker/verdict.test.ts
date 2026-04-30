import { describe, it, expect } from "vitest";
import { getVerdict } from "./verdict";
import type { PanelAnalysis, Recommendations } from "./types";

function makeAnalysis(
  overrides: Partial<PanelAnalysis["detected"]> = {},
  overallConfidence: PanelAnalysis["overallConfidence"] = "medium",
): PanelAnalysis {
  return {
    detected: {
      brand: "Square D",
      modelOrSeries: "QO",
      mainBreakerAmps: 200,
      busRatingAmps: 200,
      totalSpaces: 40,
      openFullSpaces: 10,
      openTwoPoleSpaces: 4,
      tandemQuadCompatibility: "likely yes",
      existingLargeLoads: [],
      conditionFlags: ["none"],
      labelReadable: "yes",
      notes: "",
      ...overrides,
    },
    overallConfidence,
    limitations: [],
  };
}

function makeRec(
  partial: Partial<Recommendations> = {},
): Recommendations {
  return {
    spacesNeeded: 4,
    largestBreaker: 40,
    spacesShort: 0,
    conditionConcern: false,
    options: [],
    ...partial,
  };
}

describe("getVerdict", () => {
  it("returns 'You may not need a full panel upgrade' when spaces fit", () => {
    const v = getVerdict(makeAnalysis(), makeRec({ spacesShort: 0, spacesNeeded: 4 }));
    expect(v.headline).toBe("You may not need a full panel upgrade");
    expect(v.tone).toBe("good");
  });

  it("returns 'breaker-space issue' when short on slots", () => {
    const v = getVerdict(makeAnalysis(), makeRec({ spacesShort: 2 }));
    expect(v.headline).toBe("This looks like a breaker-space issue");
    expect(v.tone).toBe("caution");
  });

  it("returns condition headline when condition concern flagged", () => {
    const v = getVerdict(
      makeAnalysis({ brand: "Federal Pacific" }),
      makeRec({ conditionConcern: true }),
    );
    expect(v.headline).toBe("Panel condition may drive replacement");
    expect(v.tone).toBe("concern");
  });

  it("returns low-confidence headline when image is unreadable and no basics", () => {
    const v = getVerdict(
      makeAnalysis(
        {
          brand: "Unknown",
          mainBreakerAmps: 0,
          totalSpaces: 0,
          labelReadable: "no",
        },
        "low",
      ),
      makeRec(),
    );
    expect(v.headline).toBe("Low confidence — upload a clearer photo");
    expect(v.tone).toBe("low-confidence");
  });

  it("does NOT show low-confidence verdict if user filled in basics", () => {
    const v = getVerdict(
      makeAnalysis(
        {
          brand: "Square D",
          mainBreakerAmps: 200,
          totalSpaces: 30,
          labelReadable: "no",
        },
        "low",
      ),
      makeRec({ spacesShort: 0, spacesNeeded: 4 }),
    );
    expect(v.headline).toBe("You may not need a full panel upgrade");
  });

  it("nudges user to pick upgrades when none selected", () => {
    const v = getVerdict(makeAnalysis(), makeRec({ spacesNeeded: 0, spacesShort: 0 }));
    expect(v.headline).toBe("Pick at least one upgrade to plan around");
  });
});
