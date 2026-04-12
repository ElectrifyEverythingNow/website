export function ColorLegend() {
  return (
    <div className="flex flex-col items-center gap-2 text-xs text-zinc-500 mt-2">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
          <span>Legal — great ROI</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-yellow-400" />
          <span>Legal — longer payback</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-200" />
          <span>Legislation pending</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-zinc-300" />
          <span>No legislation yet</span>
        </div>
      </div>
      <p className="text-zinc-400">
        State colors use weighted avg across utilities · hover for per-utility breakdown
      </p>
    </div>
  );
}
