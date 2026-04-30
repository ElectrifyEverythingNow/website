import { describe, it, expect } from "vitest";
import {
  computeRecommendations,
  isConditionConcern,
  defaultSelectedUpgrades,
} from "./recommendations";
import type { PanelAnalysis } from "./types";

function makeAnalysis(overrides: Partial<PanelAnalysis["detected"]> = {},
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
      notes: "Looks clean.",
      ...overrides,
    },
    overallConfidence,
    limitations: [],
  };
}

describe("isConditionConcern", () => {
  it("flags Federal Pacific brand", () => {
    expect(isConditionConcern("Federal Pacific", ["none"])).toBe(true);
  });

  it("flags Zinsco brand", () => {
    expect(isConditionConcern("Zinsco", [])).toBe(true);
  });

  it("flags rust", () => {
    expect(isConditionConcern("Square D", ["rust"])).toBe(true);
  });

  it("flags burn marks", () => {
    expect(isConditionConcern("Square D", ["burn marks"])).toBe(true);
  });

  it("flags double tap", () => {
    expect(isConditionConcern("Square D", ["double taps suspected"])).toBe(true);
  });

  it("does not flag clean panel", () => {
    expect(isConditionConcern("Square D", ["none"])).toBe(false);
  });

  it("ignores 'none' flag", () => {
    expect(isConditionConcern("Eaton", ["none"])).toBe(false);
  });
});

describe("computeRecommendations", () => {
  it("computes spacesNeeded and largestBreaker from selected upgrades", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    expect(r.spacesNeeded).toBe(4);
    expect(r.largestBreaker).toBe(40);
  });

  it("computes spacesShort when not enough open spaces", () => {
    const analysis = makeAnalysis({ openFullSpaces: 2 });
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    expect(r.spacesShort).toBe(2);
  });

  it("returns 0 spacesShort when plenty of room", () => {
    const analysis = makeAnalysis({ openFullSpaces: 10 });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    expect(r.spacesShort).toBe(0);
  });

  it("includes 'Add the breakers' option when spaces are sufficient and panel is clean", () => {
    const analysis = makeAnalysis({ openFullSpaces: 10 });
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Add the breakers (direct install)");
  });

  it("does not include 'Add the breakers' when condition concern present", () => {
    const analysis = makeAnalysis({
      brand: "Federal Pacific",
      openFullSpaces: 10,
    });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).not.toContain("Add the breakers (direct install)");
  });

  it("includes 'Use tandem or quad breakers' when short and compat is likely yes", () => {
    const analysis = makeAnalysis({
      openFullSpaces: 0,
      tandemQuadCompatibility: "likely yes",
    });
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Use tandem or quad breakers");
  });

  it("includes 'Check tandem/quad compatibility' when compat is unknown and short", () => {
    const analysis = makeAnalysis({
      openFullSpaces: 0,
      tandemQuadCompatibility: "unknown",
    });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Check tandem/quad compatibility");
  });

  it("includes load sharing for EV with high confidence", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, ["ev"]);
    const card = r.options.find((o) => o.title.startsWith("Simple switch"));
    expect(card?.confidence).toBe("high");
  });

  it("includes subpanel option for large service with shortage", () => {
    const analysis = makeAnalysis({
      mainBreakerAmps: 200,
      openFullSpaces: 0,
    });
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Add a small subpanel");
  });

  it("does not include subpanel for small service", () => {
    const analysis = makeAnalysis({
      mainBreakerAmps: 100,
      openFullSpaces: 0,
    });
    const r = computeRecommendations(analysis, ["heat-pump", "hpwh"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).not.toContain("Add a small subpanel");
  });

  it("includes measured load for small service", () => {
    const analysis = makeAnalysis({ mainBreakerAmps: 100 });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Measured load / smart load management");
  });

  it("always includes full panel/service upgrade as last option", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const last = r.options[r.options.length - 1];
    expect(last.title).toBe("Full panel or service upgrade");
  });

  it("rates full panel upgrade medium when condition concern present", () => {
    const analysis = makeAnalysis({ conditionFlags: ["rust", "burn marks"] });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const last = r.options[r.options.length - 1];
    expect(last.title).toBe("Full panel or service upgrade");
    expect(last.confidence).toBe("medium");
  });

  it("rates full panel upgrade low when no condition concern", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, ["heat-pump"]);
    const last = r.options[r.options.length - 1];
    expect(last.confidence).toBe("low");
  });

  it("conditionConcern is true when obsolete brand", () => {
    const analysis = makeAnalysis({ brand: "Zinsco" });
    const r = computeRecommendations(analysis, ["heat-pump"]);
    expect(r.conditionConcern).toBe(true);
  });

  it("includes measured load for 3+ upgrades selected", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, [
      "heat-pump",
      "hpwh",
      "dryer",
    ]);
    const titles = r.options.map((o) => o.title);
    expect(titles).toContain("Measured load / smart load management");
  });

  it("returns 0 spacesNeeded for empty selection", () => {
    const analysis = makeAnalysis();
    const r = computeRecommendations(analysis, []);
    expect(r.spacesNeeded).toBe(0);
    expect(r.largestBreaker).toBe(0);
  });

  it("computes spacesNeeded/largestBreaker from selected upgrades even with a fallback (Unknown) analysis", () => {
    const fallback = makeAnalysis(
      {
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
      "low",
    );
    const r = computeRecommendations(fallback, [
      "heat-pump",
      "hpwh",
      "ev",
    ]);
    // 2 + 2 + 2 = 6 slots; max amps = 50 (EV)
    expect(r.spacesNeeded).toBe(6);
    expect(r.largestBreaker).toBe(50);
    // Full-panel option should still be present as last
    expect(r.options[r.options.length - 1].title).toBe(
      "Full panel or service upgrade",
    );
  });
});

describe("defaultSelectedUpgrades", () => {
  it("returns heat-pump and hpwh", () => {
    const ids = defaultSelectedUpgrades();
    expect(ids).toContain("heat-pump");
    expect(ids).toContain("hpwh");
  });
});
