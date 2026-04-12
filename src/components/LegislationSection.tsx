"use client";

import { useState } from "react";

interface LawEntry {
  state: string;
  status: "signed" | "passed" | "introduced";
  bill: string;
  billUrl: string;
  summary: string;
  details: string;
  sourceLabel: string;
  sourceUrl: string;
}

const LAWS: LawEntry[] = [
  {
    state: "Utah",
    status: "signed",
    bill: "HB 340",
    billUrl: "https://le.utah.gov/~2025/bills/static/HB0340.html",
    summary:
      "First state to legalize plug-in solar. Signed March 2025 with unanimous bipartisan support (72-0 House, 27-0 Senate).",
    details:
      "Allows portable solar devices up to 1,200W connecting to standard 120V outlets. No interconnection application required. Devices must include anti-islanding protection and meet UL/NEC standards.",
    sourceLabel: "pv magazine USA",
    sourceUrl:
      "https://pv-magazine-usa.com/2025/03/05/balcony-solar-gains-unanimous-bipartisan-support-in-utah/",
  },
  {
    state: "Virginia",
    status: "passed",
    bill: "HB 395 / SB 250",
    billUrl:
      "https://virginiamercury.com/2026/03/10/plug-in-solar-panels-near-approval-by-general-assembly/",
    summary:
      "Passed General Assembly in March 2026. Awaiting governor's signature. Effective 2027.",
    details:
      "Allows small portable solar generation devices up to 1,200W. Exempts systems from interconnection agreements. Prevents landlords with 4+ rental units from banning balcony solar.",
    sourceLabel: "Virginia Mercury",
    sourceUrl:
      "https://virginiamercury.com/2026/03/10/plug-in-solar-panels-near-approval-by-general-assembly/",
  },
  {
    state: "Maine",
    status: "signed",
    bill: "LD 1730",
    billUrl:
      "https://legislature.maine.gov/legis/bills/getTestimonyDoc.asp?id=10057255",
    summary:
      "Signed by Governor Mills on April 6, 2026. Creates two tiers based on system output.",
    details:
      "Systems ≤420W: DIY install, no utility notification required. Systems 421–1,200W: licensed electrician install, utility notification within 30 days. All devices must meet UL 3700 certification. Could save the average Maine household ~$388/year.",
    sourceLabel: "pv magazine USA",
    sourceUrl:
      "https://pv-magazine-usa.com/2026/04/03/maine-becomes-third-state-to-pass-plug-in-solar-legislation/",
  },
  {
    state: "Colorado",
    status: "passed",
    bill: "HB 26-1007",
    billUrl:
      "https://www.cohousedems.com/news/house-passes-bill-to-allow-plug-in-solar-panels",
    summary:
      "Passed House (48-16) and Senate (April 10, 2026). Awaiting governor's signature.",
    details:
      "Classifies plug-in solar as personal property, preventing HOA and local government bans. No utility approval needed before installation. Requires UL 3700 certification. Encourages meter collar adoption for seamless grid interconnection.",
    sourceLabel: "Colorado House Democrats",
    sourceUrl:
      "https://www.cohousedems.com/news/house-passes-bill-to-allow-plug-in-solar-panels",
  },
  {
    state: "New York",
    status: "introduced",
    bill: "SUNNY Act (S8512)",
    billUrl:
      "https://www.nysenate.gov/legislation/bills/2025/S8512/amendment/original",
    summary:
      "Introduced September 2025 by Senator Krueger and Assemblymember Gallagher. In committee.",
    details:
      "Would exempt small plug-in solar from interconnection and net metering requirements. Prohibits utilities from requiring approval or fees for plug-in devices. Aims to expand solar access for renters and apartment dwellers.",
    sourceLabel: "NY Senate",
    sourceUrl:
      "https://www.nysenate.gov/newsroom/press-releases/2025/liz-krueger/krueger-gallagher-introduce-sunny-act-support-balcony",
  },
  {
    state: "Illinois",
    status: "introduced",
    bill: "SB 3104 / HB 4524",
    billUrl:
      "https://www.senatorventura.com/news/press-releases/283-ventura-legislation-to-allow-to-plug-in-solar-panels-for-illinois-residents-passes-committee",
    summary:
      "Passed committee. Replaces utility approval with simple notification. Prevents HOA bans on sub-392W systems.",
    details:
      "Defines plug-in solar as lightweight units up to 1,200W through an existing outlet. Eliminates installation fees. Systems under 392W cannot be banned by landlords or HOAs. Only utility notification (not approval) required within 30 days.",
    sourceLabel: "Capitol News Illinois",
    sourceUrl:
      "https://capitolnewsillinois.com/news/lawmakers-seek-measure-to-make-small-scale-plug-in-solar-panels-available-to-renters/",
  },
];

const STATUS_STYLES: Record<
  LawEntry["status"],
  { bg: string; text: string; label: string }
> = {
  signed: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Signed into Law",
  },
  passed: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Passed Legislature",
  },
  introduced: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Introduced",
  },
};

export function LegislationSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-900">
            Plug-In Solar Legislation Tracker
          </h2>
        </div>
        <p className="text-sm text-zinc-500 mb-4">
          Lawmakers in{" "}
          <a
            href="https://www.canarymedia.com/articles/solar/balcony-solar-taking-state-legislatures-by-storm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 underline underline-offset-2"
          >
            28+ states
          </a>{" "}
          have introduced bills to legalize plug-in solar. Here are the states
          leading the way.
        </p>

        <div className="space-y-3">
          {LAWS.map((law, i) => {
            const style = STATUS_STYLES[law.status];
            const isExpanded = expandedIndex === i;
            return (
              <div
                key={law.state}
                className="border border-zinc-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                >
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} whitespace-nowrap`}
                  >
                    {style.label}
                  </span>
                  <span className="font-medium text-zinc-900 flex-1 min-w-0">
                    {law.state}{" "}
                    <span className="text-zinc-400 font-normal">
                      — {law.bill}
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    <p className="text-sm text-zinc-600">{law.summary}</p>
                    <p className="text-sm text-zinc-500">{law.details}</p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={law.billUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-green-600 hover:text-green-700 underline underline-offset-2"
                      >
                        Read the bill &rarr;
                      </a>
                      <a
                        href={law.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-400 hover:text-zinc-600 underline underline-offset-2"
                      >
                        Source: {law.sourceLabel}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">
            All current bills cap plug-in solar at 1,200 watts and require UL
            certification for safety.{" "}
            <a
              href="https://solarrights.org/plug-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              Track all states at Solar Rights Alliance
            </a>{" "}
            |{" "}
            <a
              href="https://www.wri.org/insights/enabling-plug-in-solar-states"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              WRI policy overview
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
