import Link from "next/link";

export function NextSteps() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm print:hidden">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Keep going
      </h3>
      <p className="text-xs text-zinc-500 mt-1">
        Two more free tools that pair with this report.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Link
          href="/rates"
          className="block rounded-lg border border-zinc-200 hover:border-green-500 hover:bg-green-50 transition-colors p-4 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              ⚙️
            </span>
            <div className="text-sm font-semibold text-zinc-900 group-hover:text-green-800">
              Next: compare electricity rate plans
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            See whether a TOU or EV rate plan saves more once you add a heat
            pump or charger.
          </p>
        </Link>

        <Link
          href="/solar"
          className="block rounded-lg border border-zinc-200 hover:border-green-500 hover:bg-green-50 transition-colors p-4 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              🔆
            </span>
            <div className="text-sm font-semibold text-zinc-900 group-hover:text-green-800">
              Also check plug-in solar economics
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Find out whether balcony or patio solar pencils out for your state
            and utility rate.
          </p>
        </Link>
      </div>
    </div>
  );
}
