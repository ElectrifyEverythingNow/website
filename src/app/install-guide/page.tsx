import Link from "next/link";

export default function InstallGuideIndexPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-white">
      <section className="w-full bg-gradient-to-b from-green-50 to-white pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Install Guides
        </h1>
        <p className="text-lg text-zinc-500 mt-2 max-w-xl mx-auto">
          Practical, homeowner-friendly install walkthroughs for electrification.
        </p>
      </section>

      <section className="w-full max-w-3xl mx-auto px-4 pb-10 pt-2 grid gap-4 sm:grid-cols-2">
        <Link
          href="/solar/how-to-install"
          className="block rounded-2xl border border-zinc-200 hover:border-green-500 hover:bg-green-50 transition-colors p-5 shadow-sm"
        >
          <div className="text-2xl mb-2" aria-hidden>
            🔆
          </div>
          <h2 className="text-base font-bold text-zinc-900">
            Plug-In / Balcony Solar
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            UL 3700-certified panels, mounting tips, and what to ask your
            utility. 8 steps.
          </p>
          <span className="text-xs text-green-700 font-semibold mt-3 inline-block">
            Read the guide →
          </span>
        </Link>

        <div className="block rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 shadow-sm">
          <div className="text-2xl mb-2" aria-hidden>
            ⚡
          </div>
          <h2 className="text-base font-bold text-zinc-900">
            More guides coming soon
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            Heat pumps, EV chargers, and HPWH walkthroughs are in the works.
            Check the{" "}
            <Link href="/" className="text-green-700 underline underline-offset-2">
              homepage
            </Link>{" "}
            to subscribe.
          </p>
        </div>
      </section>

      <footer className="w-full py-6 text-center text-sm text-zinc-400 border-t border-zinc-100 mt-auto">
        <p className="mt-1">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://electrifyeverythingnow.com"
            className="text-zinc-500 hover:text-green-600 underline underline-offset-2"
          >
            ElectrifyEverythingNow.com
          </a>
        </p>
      </footer>
    </main>
  );
}
