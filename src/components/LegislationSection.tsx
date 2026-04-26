"use client";

import { useState } from "react";
import { LAWS, STATUS_STYLES } from "@/data/legislation-details";
import type { LawEntry } from "@/data/legislation-details";

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
            href="https://www.canarymedia.com/articles/solar/states-passing-balcony-solar-laws"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 underline underline-offset-2"
          >
            33+ states
          </a>{" "}
          have introduced bills to legalize plug-in solar — and Utah, Maine, and
          Washington have already enacted laws. Here are the states leading the
          way.
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
