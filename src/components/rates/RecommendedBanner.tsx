interface RecommendedBannerProps {
  planName: string;
  annualSavings: number;
}

export function RecommendedBanner({ planName, annualSavings }: RecommendedBannerProps) {
  return (
    <div className="text-center mb-5">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Best Plan For You</p>
      <h2 className="text-2xl font-extrabold text-green-600 mt-1">{planName}</h2>
      {annualSavings > 0 && (
        <p className="text-sm text-zinc-600 mt-1">
          Save <span className="font-bold text-green-600">${Math.round(annualSavings).toLocaleString()}/year</span> vs. flat rate
        </p>
      )}
    </div>
  );
}
