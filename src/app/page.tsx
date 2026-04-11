import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-white">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-green-50 to-white pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight">
          Electrify Everything
        </h1>
        <p className="text-lg text-zinc-500 mt-3 max-w-lg mx-auto">
          Free tools to help homeowners save money by electrifying their homes
        </p>
      </section>

      {/* Tool Cards */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-16 grid sm:grid-cols-2 gap-6">
        <Link
          href="/solar"
          className="group block bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="text-3xl mb-3">☀️</div>
          <h2 className="text-xl font-bold text-zinc-900 group-hover:text-green-700">
            Balcony Solar Calculator
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            See if plug-in solar makes financial sense for your home. Pick your
            state, choose your utility, and get an instant payback estimate.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 mt-4">
            Try it free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </span>
        </Link>

        <Link
          href="/rates"
          className="group block bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="text-3xl mb-3">⚡</div>
          <h2 className="text-xl font-bold text-zinc-900 group-hover:text-green-700">
            Utility Rate Optimizer
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Find the cheapest electricity plan for your electrified home. Compare
            TOU, flat, and EV rate plans from your utility.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 mt-4">
            Try it free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://electrifyeverythingnow.com"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            ElectrifyEverythingNow.com
          </a>
        </p>
        <p className="mt-1">
          Built by{" "}
          <a
            href="https://joshlake.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400 underline underline-offset-2"
          >
            Josh Lake
          </a>
        </p>
      </footer>
    </main>
  );
}
