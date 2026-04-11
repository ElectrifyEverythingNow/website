import type { OpenEIRatePlan, OpenEIResponse, ParsedRatePlan } from "./openei-types";

const OPENEI_BASE = "https://api.openei.org/utility_rates";

export function parseRatePlan(raw: OpenEIRatePlan): ParsedRatePlan {
  // A plan is TOU if its weekday schedule contains more than one unique period index
  const uniquePeriods = new Set(raw.energyweekdayschedule.flat());
  const isTOU = uniquePeriods.size > 1;

  return {
    name: raw.name || raw.label,
    utility: raw.utility,
    description: raw.description || "",
    sourceUrl: raw.source || raw.uri || "",
    isTOU,
    fixedMonthlyCharge: raw.fixedchargefirstmeter ?? 0,
    energyRateStructure: raw.energyratestructure,
    weekdaySchedule: raw.energyweekdayschedule,
    weekendSchedule: raw.energyweekendschedule,
  };
}

export async function fetchRatePlans(
  zipCode: string
): Promise<{ plans: ParsedRatePlan[] } | { error: string }> {
  const apiKey = process.env.NEXT_PUBLIC_OPENEI_API_KEY;
  if (!apiKey) {
    return { error: "OpenEI API key not configured" };
  }

  const url = new URL(OPENEI_BASE);
  url.searchParams.set("version", "7");
  url.searchParams.set("format", "json");
  url.searchParams.set("detail", "full");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("address", zipCode);
  url.searchParams.set("sector", "Residential");
  url.searchParams.set("limit", "20");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      return { error: `OpenEI API error: ${res.status}` };
    }
    const data: OpenEIResponse = await res.json();
    if (!data.items || data.items.length === 0) {
      return { error: "No residential rate plans found for this zip code." };
    }
    const plans = data.items
      .filter((item) => item.energyratestructure && item.energyweekdayschedule)
      .map(parseRatePlan);
    if (plans.length === 0) {
      return { error: "No valid rate plans found for this zip code." };
    }
    return { plans };
  } catch {
    return { error: "Rate data is temporarily unavailable. Please try again in a moment." };
  }
}
