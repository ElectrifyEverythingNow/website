export function ReportPreview() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        What you&rsquo;ll see in your report
      </h3>
      <p className="text-zinc-600 mt-2">
        Once you upload a photo and click <strong>Analyze panel photo</strong>,
        you&rsquo;ll get:
      </p>
      <ul className="mt-3 space-y-2 text-zinc-700">
        <ReportItem icon="⚡" title="Likely panel size">
          Detected brand, main breaker amps, and bus rating.
        </ReportItem>
        <ReportItem icon="🔢" title="Open breaker slots">
          How many full-size and double-pole spaces appear free.
        </ReportItem>
        <ReportItem icon="⚠️" title="Possible constraints">
          Space, capacity, condition, or obsolete-equipment concerns.
        </ReportItem>
        <ReportItem icon="💡" title="Cheaper options to ask about">
          Tandems, load sharing, subpanel, measured load — before a full panel
          upgrade.
        </ReportItem>
        <ReportItem icon="📊" title="A clear verdict + confidence">
          One homeowner-friendly summary, plus low / medium / high image
          confidence.
        </ReportItem>
      </ul>
      <p className="text-xs text-zinc-500 mt-4 italic">
        You can correct anything the AI gets wrong — every detected field is
        editable, and recommendations recompute live.
      </p>
    </div>
  );
}

function ReportItem({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="text-base shrink-0" aria-hidden>
        {icon}
      </span>
      <div>
        <span className="font-semibold text-zinc-900">{title}.</span>{" "}
        <span className="text-zinc-600">{children}</span>
      </div>
    </li>
  );
}
