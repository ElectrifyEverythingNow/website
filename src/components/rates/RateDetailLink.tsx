interface RateDetailLinkProps {
  utilityName: string;
  sourceUrl: string;
}

export function RateDetailLink({ utilityName, sourceUrl }: RateDetailLinkProps) {
  if (!sourceUrl) return null;
  return (
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between bg-white rounded-xl border border-zinc-200 p-4 hover:border-green-300 transition-colors">
      <div>
        <p className="text-sm font-semibold text-zinc-700">View Full Rate Details</p>
        <p className="text-xs text-zinc-500">See {utilityName}&apos;s official rate schedules</p>
      </div>
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </a>
  );
}
