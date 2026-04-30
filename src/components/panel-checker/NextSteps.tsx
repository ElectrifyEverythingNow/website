import Link from "next/link";

interface NextStepsProps {
  /** Which tool's "current" page this is rendered on, so we don't link back to it. */
  current?: "panel-checker" | "rates" | "solar";
}

interface ToolLink {
  id: "panel-checker" | "rates" | "solar";
  href: string;
  icon: string;
  title: string;
  desc: string;
}

const TOOL_LINKS: ToolLink[] = [
  {
    id: "panel-checker",
    href: "/panel-checker",
    icon: "🔌",
    title: "Check your electrical panel",
    desc: "See whether your panel can handle a heat pump, HPWH, or EV charger before any big upgrade.",
  },
  {
    id: "rates",
    href: "/rates",
    icon: "⚙️",
    title: "Compare electricity rate plans",
    desc: "See whether a TOU or EV rate plan saves more once you add a heat pump or charger.",
  },
  {
    id: "solar",
    href: "/solar",
    icon: "🔆",
    title: "Check plug-in solar economics",
    desc: "Find out whether balcony or patio solar pencils out for your state and utility rate.",
  },
];

export function NextSteps({ current }: NextStepsProps = {}) {
  const links = TOOL_LINKS.filter((t) => t.id !== current);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm print:hidden">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Keep going
      </h3>
      <p className="text-xs text-zinc-500 mt-1">
        More free tools that pair with this one.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {links.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className="block rounded-lg border border-zinc-200 hover:border-green-500 hover:bg-green-50 transition-colors p-4 group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                {t.icon}
              </span>
              <div className="text-sm font-semibold text-zinc-900 group-hover:text-green-800">
                {t.title}
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* Sequencing CTA — same on every tool */}
      <a
        href="https://joshlake.ai/writing/electrification-sequencing"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors px-4 py-3 text-sm text-green-900"
      >
        <span className="font-semibold">Not sure what to electrify first?</span>{" "}
        Read the sequencing guide
        <span aria-hidden className="inline-block ml-1">↗</span>
      </a>
    </div>
  );
}
