import type { ComparisonResult } from "@/lib/rate-calculator";
import { RecommendedBanner } from "./RecommendedBanner";
import { PlanComparisonChart } from "./PlanComparisonChart";
import { RateTimeline } from "./RateTimeline";
import { RateDetailLink } from "./RateDetailLink";

interface RateResultsProps {
  result: ComparisonResult;
  hasEv: boolean;
  hasSolar: boolean;
  hasHeatPump: boolean;
}

export function RateResults({ result, hasEv, hasSolar, hasHeatPump }: RateResultsProps) {
  const { recommended, allPlans, annualSavings } = result;
  return (
    <div className="space-y-4">
      <RecommendedBanner planName={recommended.plan.name} annualSavings={annualSavings} />
      <PlanComparisonChart plans={allPlans} recommendedName={recommended.plan.name} />
      <RateTimeline plan={recommended.plan} hasEv={hasEv} hasSolar={hasSolar} hasHeatPump={hasHeatPump} />
      <RateDetailLink utilityName={recommended.plan.utility} sourceUrl={recommended.plan.sourceUrl} />
    </div>
  );
}
