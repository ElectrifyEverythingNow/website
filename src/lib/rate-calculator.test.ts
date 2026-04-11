import { describe, it, expect } from "vitest";
import { calculateMonthlyBill, findBestPlan } from "./rate-calculator";
import type { ParsedRatePlan } from "./openei-types";
import type { MonthlyKwhInput } from "./usage-profiles";

const FLAT_PLAN: ParsedRatePlan = {
  name: "Flat Rate",
  utility: "Test Utility",
  description: "Standard flat rate",
  sourceUrl: "https://example.com",
  isTOU: false,
  fixedMonthlyCharge: 10,
  energyRateStructure: [[{ rate: 0.14, unit: "kWh" }]],
  weekdaySchedule: Array(12).fill(Array(24).fill(0)),
  weekendSchedule: Array(12).fill(Array(24).fill(0)),
};

const TOU_PLAN: ParsedRatePlan = {
  name: "TOU Rate",
  utility: "Test Utility",
  description: "Time-of-use",
  sourceUrl: "https://example.com",
  isTOU: true,
  fixedMonthlyCharge: 12,
  energyRateStructure: [
    [{ rate: 0.08, unit: "kWh" }],   // period 0: off-peak
    [{ rate: 0.18, unit: "kWh" }],   // period 1: peak
  ],
  weekdaySchedule: Array(12).fill([
    0, 0, 0, 0, 0, 0,   // 12am-5am: off-peak
    0, 0, 0, 0, 1, 1,   // 6am-11am: off-peak then peak
    1, 1, 1, 1, 1, 1,   // 12pm-5pm: peak
    1, 0, 0, 0, 0, 0,   // 6pm-11pm: peak then off-peak
  ]),
  weekendSchedule: Array(12).fill(Array(24).fill(0)), // all off-peak
};

const DEFAULT_INPUT: MonthlyKwhInput = {
  homeSqFt: 2500,
  hasEv: true,
  evMilesPerMonth: 1000,
  hasHeatPump: true,
  hasSolar: true,
  solarSizeKw: 5,
  month: 6,
};

describe("calculateMonthlyBill", () => {
  it("calculates flat rate bill correctly", () => {
    const result = calculateMonthlyBill(FLAT_PLAN, DEFAULT_INPUT);
    expect(result.totalMonthlyCost).toBeGreaterThan(0);
    expect(result.fixedCharge).toBe(10);
    expect(result.byCategory.base).toBeGreaterThan(0);
    expect(result.byCategory.ev).toBeGreaterThan(0);
    expect(result.byCategory.heatPump).toBeGreaterThan(0);
    expect(result.byCategory.solarCredit).toBeLessThanOrEqual(0);
  });

  it("TOU plan costs less than flat for solar+EV homes", () => {
    const flatBill = calculateMonthlyBill(FLAT_PLAN, DEFAULT_INPUT);
    const touBill = calculateMonthlyBill(TOU_PLAN, DEFAULT_INPUT);
    expect(touBill.totalMonthlyCost).toBeLessThan(flatBill.totalMonthlyCost);
  });

  it("returns zero EV cost when no EV", () => {
    const input = { ...DEFAULT_INPUT, hasEv: false, evMilesPerMonth: 0 };
    const result = calculateMonthlyBill(FLAT_PLAN, input);
    expect(result.byCategory.ev).toBe(0);
  });

  it("includes fixed charge in total", () => {
    const result = calculateMonthlyBill(FLAT_PLAN, DEFAULT_INPUT);
    expect(result.totalMonthlyCost).toBeGreaterThan(result.fixedCharge);
  });
});

describe("findBestPlan", () => {
  it("returns the cheapest plan as recommended", () => {
    const result = findBestPlan([FLAT_PLAN, TOU_PLAN], DEFAULT_INPUT);
    expect(result.recommended.plan.name).toBe("TOU Rate");
    expect(result.annualSavings).toBeGreaterThan(0);
  });

  it("sorts plans by average monthly cost ascending", () => {
    const result = findBestPlan([FLAT_PLAN, TOU_PLAN], DEFAULT_INPUT);
    const costs = result.allPlans.map((p) => p.avgMonthlyCost);
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    }
  });
});
