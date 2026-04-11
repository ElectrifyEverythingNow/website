/** A single tier within a rate period */
export interface RateTier {
  rate: number;      // $/kWh
  max?: number;      // kWh cap for this tier (absent = unlimited)
  unit?: string;     // typically "kWh"
  adj?: number;      // adjustment factor
}

/** Full rate plan from OpenEI API */
export interface OpenEIRatePlan {
  label: string;
  utility: string;
  name: string;
  uri: string;
  source: string;
  sector: string;
  description: string;
  startdate?: number;
  enddate?: number;
  energyratestructure: RateTier[][];
  energyweekdayschedule: number[][];   // 12 months x 24 hours
  energyweekendschedule: number[][];   // 12 months x 24 hours
  fixedchargefirstmeter?: number;
  fixedchargeunits?: string;
  demandratestructure?: RateTier[][];
  demandweekdayschedule?: number[][];
  demandweekendschedule?: number[][];
}

/** Parsed rate plan for our calculator */
export interface ParsedRatePlan {
  name: string;
  utility: string;
  description: string;
  sourceUrl: string;
  isTOU: boolean;
  fixedMonthlyCharge: number;
  energyRateStructure: RateTier[][];
  weekdaySchedule: number[][];   // 12x24
  weekendSchedule: number[][];   // 12x24
}

/** OpenEI API response wrapper */
export interface OpenEIResponse {
  items: OpenEIRatePlan[];
  errors?: { error: string }[];
}
