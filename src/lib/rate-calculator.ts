import type { ParsedRatePlan } from "./openei-types";
import type { MonthlyKwhInput } from "./usage-profiles";
import {
  getMonthlyKwh,
  BASE_LOAD_SHAPE,
  EV_LOAD_SHAPE,
  HEAT_PUMP_LOAD_SHAPE,
  SOLAR_GENERATION_SHAPE,
} from "./usage-profiles";

export interface BillBreakdown {
  totalMonthlyCost: number;
  fixedCharge: number;
  energyCharge: number;
  byCategory: {
    base: number;
    ev: number;
    heatPump: number;
    solarCredit: number;
  };
}

export interface PlanResult {
  plan: ParsedRatePlan;
  avgMonthlyCost: number;
  monthlyBills: BillBreakdown[];
  avgBreakdown: BillBreakdown;
}

export interface ComparisonResult {
  recommended: PlanResult;
  allPlans: PlanResult[];
  annualSavings: number;
  flatPlanCost: number;
}

function getRateForHour(
  plan: ParsedRatePlan,
  month: number,
  hour: number,
  isWeekend: boolean
): number {
  const schedule = isWeekend ? plan.weekendSchedule : plan.weekdaySchedule;
  const periodIndex = schedule[month]?.[hour] ?? 0;
  const tiers = plan.energyRateStructure[periodIndex];
  if (!tiers || tiers.length === 0) return 0;
  return tiers[0].rate ?? 0;
}

export function calculateMonthlyBill(
  plan: ParsedRatePlan,
  input: MonthlyKwhInput
): BillBreakdown {
  const monthly = getMonthlyKwh(input);

  let baseCost = 0;
  let evCost = 0;
  let heatPumpCost = 0;
  let solarCredit = 0;

  for (const isWeekend of [false, true]) {
    const weight = isWeekend ? 2 / 7 : 5 / 7;

    for (let hour = 0; hour < 24; hour++) {
      const rate = getRateForHour(plan, input.month, hour, isWeekend);

      const baseHourKwh = monthly.baseKwh * BASE_LOAD_SHAPE[hour];
      const evHourKwh = monthly.evKwh * EV_LOAD_SHAPE[hour];
      const hpHourKwh = monthly.heatPumpKwh * HEAT_PUMP_LOAD_SHAPE[hour];
      const solarHourKwh = monthly.solarKwh * SOLAR_GENERATION_SHAPE[hour];

      baseCost += baseHourKwh * rate * weight;
      evCost += evHourKwh * rate * weight;
      heatPumpCost += hpHourKwh * rate * weight;
      solarCredit -= solarHourKwh * rate * weight;
    }
  }

  const energyCharge = baseCost + evCost + heatPumpCost + solarCredit;
  const totalMonthlyCost = Math.max(0, plan.fixedMonthlyCharge + energyCharge);

  return {
    totalMonthlyCost,
    fixedCharge: plan.fixedMonthlyCharge,
    energyCharge,
    byCategory: {
      base: baseCost,
      ev: evCost,
      heatPump: heatPumpCost,
      solarCredit,
    },
  };
}

function averageBills(bills: BillBreakdown[]): BillBreakdown {
  const n = bills.length;
  if (n === 0) {
    return {
      totalMonthlyCost: 0,
      fixedCharge: 0,
      energyCharge: 0,
      byCategory: { base: 0, ev: 0, heatPump: 0, solarCredit: 0 },
    };
  }
  return {
    totalMonthlyCost: bills.reduce((s, b) => s + b.totalMonthlyCost, 0) / n,
    fixedCharge: bills[0].fixedCharge,
    energyCharge: bills.reduce((s, b) => s + b.energyCharge, 0) / n,
    byCategory: {
      base: bills.reduce((s, b) => s + b.byCategory.base, 0) / n,
      ev: bills.reduce((s, b) => s + b.byCategory.ev, 0) / n,
      heatPump: bills.reduce((s, b) => s + b.byCategory.heatPump, 0) / n,
      solarCredit: bills.reduce((s, b) => s + b.byCategory.solarCredit, 0) / n,
    },
  };
}

export function findBestPlan(
  plans: ParsedRatePlan[],
  baseInput: Omit<MonthlyKwhInput, "month">
): ComparisonResult {
  const planResults: PlanResult[] = plans.map((plan) => {
    const monthlyBills: BillBreakdown[] = [];
    for (let month = 0; month < 12; month++) {
      monthlyBills.push(calculateMonthlyBill(plan, { ...baseInput, month }));
    }
    const avgMonthlyCost =
      monthlyBills.reduce((s, b) => s + b.totalMonthlyCost, 0) / 12;
    return {
      plan,
      avgMonthlyCost,
      monthlyBills,
      avgBreakdown: averageBills(monthlyBills),
    };
  });

  planResults.sort((a, b) => a.avgMonthlyCost - b.avgMonthlyCost);

  const recommended = planResults[0];
  const flatPlan = planResults.find((p) => !p.plan.isTOU);
  const flatAnnual = flatPlan ? flatPlan.avgMonthlyCost * 12 : recommended.avgMonthlyCost * 12;
  const annualSavings = flatAnnual - recommended.avgMonthlyCost * 12;

  return {
    recommended,
    allPlans: planResults,
    annualSavings: Math.max(0, annualSavings),
    flatPlanCost: flatAnnual,
  };
}
