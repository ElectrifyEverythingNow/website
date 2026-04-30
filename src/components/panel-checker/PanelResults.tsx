"use client";

import type {
  AnalyzePanelResponse,
  UpgradeId,
} from "@/lib/panel-checker/types";
import { getUpgrade } from "@/lib/panel-checker/types";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface PanelResultsProps {
  response: AnalyzePanelResponse;
  selectedUpgrades: UpgradeId[];
}

function verdictLine(r: AnalyzePanelResponse): string {
  if (r.recommendations.conditionConcern) {
    return "Panel condition may drive replacement.";
  }
  if (r.recommendations.spacesShort === 0 && r.recommendations.spacesNeeded > 0) {
    return "Open spaces may be enough.";
  }
  if (r.recommendations.spacesShort > 0) {
    return "Check cheaper options first.";
  }
  return "Plan with an electrician using these notes.";
}

function fmtNumber(n: number): string {
  if (!n) return "—";
  return String(n);
}

export function PanelResults({ response, selectedUpgrades }: PanelResultsProps) {
  const { analysis, recommendations } = response;
  const d = analysis.detected;

  return (
    <div className="space-y-5">
      {/* Verdict */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-green-50 to-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Summary verdict
        </div>
        <div className="text-xl font-bold text-zinc-900 mt-1">
          {verdictLine(response)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <ConfidenceBadge confidence={analysis.overallConfidence} />
          {recommendations.conditionConcern && (
            <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              Condition concern
            </span>
          )}
        </div>
        {analysis.limitations.length > 0 && (
          <ul className="mt-3 text-xs text-zinc-500 list-disc list-inside">
            {analysis.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Detected facts */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Detected panel
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <Tile label="Brand" value={d.brand} />
          <Tile
            label="Main breaker"
            value={d.mainBreakerAmps ? `${d.mainBreakerAmps} A` : "Unknown"}
          />
          <Tile
            label="Spaces (open / total)"
            value={`${fmtNumber(d.openFullSpaces)} / ${fmtNumber(d.totalSpaces)}`}
          />
          <Tile label="Tandem/quad" value={d.tandemQuadCompatibility} />
        </div>
        {d.notes && (
          <p className="text-xs text-zinc-500 italic mt-3">&ldquo;{d.notes}&rdquo;</p>
        )}
        {d.existingLargeLoads.length > 0 && (
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Existing large loads
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {d.existingLargeLoads.map((l, i) => (
                <span
                  key={i}
                  className="text-xs rounded-full bg-zinc-100 text-zinc-700 px-2 py-0.5"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
        {d.conditionFlags.filter((f) => f.toLowerCase() !== "none").length > 0 && (
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Condition flags
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {d.conditionFlags
                .filter((f) => f.toLowerCase() !== "none")
                .map((l, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-0.5"
                  >
                    {l}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected upgrades + capacity needed */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Selected upgrades
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedUpgrades.length === 0 && (
            <span className="text-xs text-zinc-500">None selected.</span>
          )}
          {selectedUpgrades.map((id) => {
            const u = getUpgrade(id);
            if (!u) return null;
            return (
              <span
                key={id}
                className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-0.5"
              >
                {u.shortLabel}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Tile label="Spaces requested" value={String(recommendations.spacesNeeded)} />
          <Tile label="Spaces short" value={String(recommendations.spacesShort)} />
          <Tile
            label="Largest new breaker"
            value={
              recommendations.largestBreaker
                ? `${recommendations.largestBreaker} A`
                : "—"
            }
          />
          <Tile label="Image confidence" value={analysis.overallConfidence} />
        </div>
      </div>

      {/* Solution cards */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Potential solutions
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Ranked roughly cheapest to most expensive. Ask an electrician about
          these before approving a full panel/service upgrade.
        </p>
        <div className="space-y-3 mt-3">
          {recommendations.options.map((opt, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="font-semibold text-zinc-900">{opt.title}</div>
                <ConfidenceBadge confidence={opt.confidence} />
              </div>
              <div className="text-sm text-zinc-600 mt-1">
                Rough cost: <span className="font-semibold">{opt.cost}</span>
              </div>
              <div className="text-sm text-zinc-700 mt-2">{opt.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Electrician checklist */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Ask the electrician
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 list-disc list-inside">
          <li>Is the problem spaces, amperage, panel condition, or utility service?</li>
          <li>Does this exact panel allow tandem/quad breakers?</li>
          <li>Can EV or HPWH be load-managed?</li>
          <li>Would a subpanel solve spaces?</li>
          <li>What cheaper options did you rule out?</li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 leading-relaxed">
        This is a planning tool only. It is not electrical advice, a
        permit-ready load calculation, or a substitute for a licensed
        electrician or local AHJ. Always have a qualified electrician verify
        breaker compatibility, wire sizing, load calculations, permits, and
        code compliance.
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
        {label}
      </div>
      <div className="text-sm font-semibold text-zinc-900 mt-0.5 break-words">
        {value || "Unknown"}
      </div>
    </div>
  );
}
