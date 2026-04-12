import type { ApplianceDefinition, ApplianceResult, VehicleResult, AnyResult, Urgency } from "./types";

const AVG_ANNUAL_MILES = 12_000;
const VEHICLE_MILE_LIMIT = 150_000;
const VEHICLE_AGE_LIMIT = 12;

export function getUrgency(yearsRemaining: number): Urgency {
  if (yearsRemaining <= 3) return "critical";
  if (yearsRemaining <= 6) return "warning";
  return "good";
}

export function getLifeConsumedPercent(installYear: number, midpointLifespan: number): number {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - installYear);
  return Math.min(100, Math.round((age / midpointLifespan) * 100));
}

export function getApplianceResult(
  appliance: ApplianceDefinition,
  installYear: number
): ApplianceResult {
  const currentYear = new Date().getFullYear();
  const midpoint = (appliance.minLifespan + appliance.maxLifespan) / 2;
  const midpointInt = Math.floor(midpoint);
  const yearsRemaining = Math.floor(midpoint - (currentYear - installYear));

  return {
    id: appliance.id,
    name: appliance.name,
    emoji: appliance.emoji,
    upgradeTo: appliance.upgradeTo,
    minLifespan: appliance.minLifespan,
    maxLifespan: appliance.maxLifespan,
    installYear,
    projectedDeathYear: installYear + midpointInt,
    yearsRemaining,
    lifeConsumedPercent: getLifeConsumedPercent(installYear, midpoint),
    urgency: getUrgency(yearsRemaining),
    emergencyCost: appliance.emergencyCost,
    plannedCost: appliance.plannedCost,
    rebateNote: appliance.rebateNote,
  };
}

export function getVehicleResult(modelYear: number, currentMiles: number): VehicleResult {
  const currentYear = new Date().getFullYear();
  const milesRemaining = Math.max(0, VEHICLE_MILE_LIMIT - currentMiles);
  const mileDeathYear = currentYear + Math.ceil(milesRemaining / AVG_ANNUAL_MILES);
  const ageDeathYear = modelYear + VEHICLE_AGE_LIMIT;
  const projectedDeathYear = Math.min(mileDeathYear, ageDeathYear);
  const yearsRemaining = projectedDeathYear - currentYear;
  const lifeConsumedPercent = Math.min(100, Math.round((currentMiles / VEHICLE_MILE_LIMIT) * 100));

  return {
    id: "vehicle",
    name: "Vehicle",
    emoji: "🚗",
    upgradeTo: "Electric Vehicle",
    modelYear,
    currentMiles,
    projectedDeathYear,
    yearsRemaining,
    lifeConsumedPercent,
    urgency: getUrgency(yearsRemaining),
  };
}

const URGENCY_ORDER: Record<Urgency, number> = {
  critical: 0,
  warning: 1,
  good: 2,
};

export function sortByUrgency(results: AnyResult[]): AnyResult[] {
  return [...results].sort((a, b) => {
    const urgencyDiff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return a.yearsRemaining - b.yearsRemaining;
  });
}
