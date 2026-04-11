import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRatePlans, parseRatePlan } from "./openei";
import type { OpenEIRatePlan } from "./openei-types";

const MOCK_FLAT_PLAN: OpenEIRatePlan = {
  label: "Residential Flat",
  utility: "Xcel Energy",
  name: "R - Residential Service",
  uri: "https://openei.org/apps/IURDB/rate/view/123",
  source: "https://www.xcelenergy.com/rates",
  sector: "Residential",
  description: "Standard residential flat rate",
  energyratestructure: [[{ rate: 0.14, unit: "kWh" }]],
  energyweekdayschedule: Array(12).fill(Array(24).fill(0)),
  energyweekendschedule: Array(12).fill(Array(24).fill(0)),
  fixedchargefirstmeter: 8.5,
  fixedchargeunits: "$/month",
};

const MOCK_TOU_PLAN: OpenEIRatePlan = {
  label: "Residential TOU",
  utility: "Xcel Energy",
  name: "RE-TOU - Residential Time-of-Use",
  uri: "https://openei.org/apps/IURDB/rate/view/456",
  source: "https://www.xcelenergy.com/rates",
  sector: "Residential",
  description: "Time-of-use residential rate",
  energyratestructure: [
    [{ rate: 0.08, unit: "kWh" }],
    [{ rate: 0.13, unit: "kWh" }],
    [{ rate: 0.18, unit: "kWh" }],
  ],
  energyweekdayschedule: Array(12).fill([
    0, 0, 0, 0, 0, 0,   // 12am-6am: off-peak (0)
    1, 1, 1, 1, 1, 1,   // 6am-12pm: mid-peak (1)
    2, 2, 2, 2, 2, 2,   // 12pm-6pm: peak (2)
    1, 1, 1, 1, 0, 0,   // 6pm-12am: mid then off-peak
  ]),
  energyweekendschedule: Array(12).fill(Array(24).fill(0)),
  fixedchargefirstmeter: 10.0,
  fixedchargeunits: "$/month",
};

describe("parseRatePlan", () => {
  it("parses a flat rate plan", () => {
    const parsed = parseRatePlan(MOCK_FLAT_PLAN);
    expect(parsed.name).toBe("R - Residential Service");
    expect(parsed.isTOU).toBe(false);
    expect(parsed.fixedMonthlyCharge).toBe(8.5);
    expect(parsed.energyRateStructure).toHaveLength(1);
    expect(parsed.energyRateStructure[0][0].rate).toBe(0.14);
  });

  it("parses a TOU plan and detects isTOU", () => {
    const parsed = parseRatePlan(MOCK_TOU_PLAN);
    expect(parsed.name).toBe("RE-TOU - Residential Time-of-Use");
    expect(parsed.isTOU).toBe(true);
    expect(parsed.fixedMonthlyCharge).toBe(10.0);
    expect(parsed.energyRateStructure).toHaveLength(3);
  });

  it("handles missing fixedchargefirstmeter", () => {
    const plan = { ...MOCK_FLAT_PLAN, fixedchargefirstmeter: undefined };
    const parsed = parseRatePlan(plan);
    expect(parsed.fixedMonthlyCharge).toBe(0);
  });

  it("sets sourceUrl from source field", () => {
    const parsed = parseRatePlan(MOCK_FLAT_PLAN);
    expect(parsed.sourceUrl).toBe("https://www.xcelenergy.com/rates");
  });
});

describe("fetchRatePlans", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_OPENEI_API_KEY", "test-api-key");
  });

  it("returns parsed plans on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [MOCK_FLAT_PLAN, MOCK_TOU_PLAN] }),
    }));

    const result = await fetchRatePlans("80302");
    expect("plans" in result).toBe(true);
    if ("plans" in result) {
      expect(result.plans).toHaveLength(2);
      expect(result.plans[0].name).toBe("R - Residential Service");
    }
  });

  it("returns error on API failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const result = await fetchRatePlans("80302");
    expect("error" in result).toBe(true);
  });

  it("returns error when no items found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    }));

    const result = await fetchRatePlans("80302");
    expect("error" in result).toBe(true);
  });
});
