import Link from "next/link";

const projectCards = [
  {
    title: "Build my electrification roadmap",
    href: "/start",
    description:
      "Start with the highest-impact projects first. Get a simple sequence based on likely savings, urgency, and expensive-mistake risk.",
    cta: "Start my roadmap",
  },
  {
    title: "I was told I need a panel upgrade",
    href: "/panel-checker",
    description:
      "Get a homeowner-friendly second opinion before assuming a full service upgrade is the only path.",
    cta: "Check my panel options",
  },
  {
    title: "I want a heat pump or water heater",
    href: "/start",
    description:
      "Figure out whether HVAC, hot water, or panel questions should come first before you call contractors.",
    cta: "Prioritize my projects",
  },
  {
    title: "I want balcony solar",
    href: "/solar",
    description:
      "Use the standalone Balcony Solar Calculator to check rules, sun exposure, and whether plug-in solar is worth exploring.",
    cta: "Open balcony solar tool",
  },
];

const comingSoon = [
  "Electrification roadmap based on likely energy savings",
  "Heat pump readiness checker",
  "Heat pump water heater fit checker",
  "EV charger without panel upgrade planner",
  "Post-install rate optimizer",
  "Contractor quote question generator",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
            Independent homeowner tools. No contractor steering. No required signup.
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Electrify your home without getting talked into the wrong project.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300 sm:text-xl">
            Free, independent planning tools for heat pumps, water heaters,
            panels, balcony solar, EV charging, and contractor questions before
            you spend money. Rate optimization comes later, after you know what
            you are installing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-zinc-950 hover:bg-emerald-300"
            >
              Start with my project
            </Link>
            <Link
              href="/panel-checker"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-bold text-zinc-100 hover:border-emerald-400 hover:text-emerald-200"
            >
              Check if I really need a panel upgrade
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/70">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-bold text-white">Built for homeowners first</h2>
            <p className="mt-2 text-sm text-zinc-400">
              EEN is not affiliated with Elephant Energy or any installer. The goal is to help you ask better questions.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Simple first, details second</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Use “I’m not sure” when you do not know technical details. Tools should still give useful next steps.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">We do not keep your photos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Photo help should reduce homeowner effort, not become a data grab. Results are planning guidance, not electrical advice.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Choose your starting point</h2>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Pick the question that sounds closest. If you are not sure, use the Project Starter.
            </p>
          </div>
          <Link href="/start" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">
            Open Project Starter →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {projectCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl transition hover:border-emerald-400/70 hover:bg-zinc-900/80"
            >
              <h3 className="text-xl font-extrabold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{card.description}</p>
              <p className="mt-5 text-sm font-bold text-emerald-300">{card.cta} →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-black">Next tools being built</h2>
          <p className="mt-2 text-zinc-400">
            These are the next homeowner tools the agent system is prioritizing.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {comingSoon.map((item) => (
              <div key={item} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
