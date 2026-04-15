export type Urgency = "critical" | "warning" | "good";

export interface ApplianceDefinition {
  id: string;
  name: string;
  emoji: string;
  upgradeTo: string;
  minLifespan: number;
  maxLifespan: number;
}

export interface ApplianceFormValues {
  installYear: string;  // empty string = skipped
  skipped: boolean;
}

export interface VehicleFormValues {
  modelYear: string;
  currentMiles: string;
  skipped: boolean;
}

export interface ApplianceResult {
  id: string;
  name: string;
  emoji: string;
  upgradeTo: string;
  minLifespan: number;
  maxLifespan: number;
  installYear: number;
  projectedDeathYear: number;
  yearsRemaining: number;
  lifeConsumedPercent: number;
  urgency: Urgency;
}

export interface VehicleResult {
  id: "vehicle";
  name: "Vehicle";
  emoji: "🚗";
  upgradeTo: "Electric Vehicle";
  modelYear: number;
  currentMiles: number;
  projectedDeathYear: number;
  yearsRemaining: number;
  lifeConsumedPercent: number;
  urgency: Urgency;
}

export type AnyResult = ApplianceResult | VehicleResult;
