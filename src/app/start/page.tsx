"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeedbackWidget } from "@/components/FeedbackWidget";

type Project =
  | "panel"
  | "heat-pump"
  | "hpwh"
  | "balcony-solar"
  | "ev-charging"
  | "rates"
  | "not-sure";

type Trigger = "quote" | "old-equipment" | "bills" | "comfort" | "climate" | "new-ev" | "curious";

type Goal = "avoid-mistake" | "plan-sequence" | "ask-contractor" | "save-money" | "check-rules";

const projectOptions: { value: Project; label: string }[] = [
  { value: "panel", label: "I was told I need a panel upgrade" },
  { value: "heat-pump", label: "I want a heat pump" },
  { value: "hpwh", label: "I want a heat pump water heater" },
  { value: "balcony-solar", label: "I want balcony or plug-in solar" },
  { value: "ev-charging", label: "I want EV charging" },
  { value: "rates", label: "I want to understand utility rates" },
  { value: "not-sure", label: "I do not know where to start" },
];

const triggerOptions: { value: Trigger; label: string }[] = [
  { value: "quote", label: "A contractor quote or recommendation" },
  { value: "old-equipment", label: "Old equipment that may need replacement" },
  { value: "bills", label: "High bills" },
  { value: "comfort", label: "Comfort problems" },
  { value: "climate", label: "Climate or indoor air quality" },
  { value: "new-ev", label: "A new or planned EV" },
  { value: "curious", label: "I am curious and planning ahead" },
];

const goalOptions: { value: Goal; label: string }[] = [
  { value: "avoid-mistake", label: "Avoid an expensive mistake" },
  { value: "plan-sequence", label: "Figure out the right order" },
  { value: "ask-contractor", label: "Know what to ask a contractor" },
  { value: "save-money", label: "Save money" },
  { value: "check-rules", label: "Check rules, rates, or rebates" },
];

function recommendation(project: Project, trigger: Trigger, goal: Goal) {
  if (project === "panel" || (trigger === "quote" && goal === "avoid-mistake")) {
    return {
      title: "Start with the Panel Upgrade Second Opinion",
      body:
        "Before assuming you need a full service upgrade, separate breaker-space problems from actual electrical capacity problems. The tool will give you questions to ask an electrician.",
      href: "/panel-checker",
      cta: "Open Panel Checker",
      next: [
        "Ask whether the issue is breaker space, load capacity, panel compatibility, or code/AHJ requirement.",
        "If you have a panel photo, use it only if helpful. We do not keep your photos.",
        "Save the result questions and use them before approving expensive electrical work.",
      ],
    };
  }

  if (project === "balcony-solar" || goal === "check-rules") {
    return {
      title: "Start with the Balcony Solar Calculator",
      body:
        "Rules are changing quickly. Check whether your state, building, outlet setup, and sun exposure make plug-in or balcony solar worth exploring before buying anything.",
      href: "/solar",
      cta: "Open Balcony Solar Calculator",
      next: [
        "Check state legality and building/HOA/landlord constraints first.",
        "Look at shade and orientation before getting excited about wattage.",
        "If the setup is weak, compare community solar or utility green-power options.",
      ],
    };
  }

  if (project === "rates" || goal === "save-money") {
    return {
      title: "Start with the Rate Optimizer",
      body:
        "Electrification changes when you use electricity, not just how much you use. Rate plans can matter for EVs, heat pumps, batteries, and solar.",
      href: "/rates",
      cta: "Open Rate Optimizer",
      next: [
        "Compare rate plans before assuming a project saves money immediately.",
        "Watch for time-of-use windows if you have or plan to add an EV or battery.",
        "Use this as planning guidance, then verify with your utility.",
      ],
    };
  }

  if (project === "heat-pump") {
    return {
      title: "Heat Pump Readiness is the next tool to build",
      body:
        "The full checker is coming next. For now, your best first move is to gather current furnace/AC info and ask contractors about sizing, cold-weather performance, backup heat, and electrical scope.",
      href: "/install-guide",
      cta: "Read current guides",
      next: [
        "Do not replace a furnace with another furnace without getting at least one heat pump quote.",
        "Ask whether the quote includes load calculation, electrical work, backup heat, and rebate paperwork.",
        "Use the Panel Checker if the contractor says electrical capacity is the blocker.",
      ],
    };
  }

  if (project === "hpwh") {
    return {
      title: "Heat Pump Water Heater Fit Checker is the next simple tool",
      body:
        "The tool is coming next. The main early question is whether your water heater location has enough air volume, drainage, electrical path, and noise tolerance.",
      href: "/install-guide",
      cta: "Read current guides",
      next: [
        "Take photos of the water heater, label, surrounding space, and nearby drain.",
        "Ask about 120V vs 240V options and whether electrical work is included.",
        "Plan before emergency replacement if you can. Emergency swaps often default back to gas.",
      ],
    };
  }

  if (project === "ev-charging" || trigger === "new-ev") {
    return {
      title: "Start with panel questions, then EV charger sizing",
      body:
        "Most homeowners need reliable overnight charging, not the maximum charger size. Lower-amp Level 2, Level 1, load sharing, or dynamic load management may avoid bigger electrical work.",
      href: "/panel-checker",
      cta: "Check panel options first",
      next: [
        "Estimate your daily miles and overnight parking time before sizing the charger.",
        "Ask about lower-amp Level 2 and load management before assuming a panel upgrade.",
        "Use the Panel Checker if an electrician says the panel is the blocker.",
      ],
    };
  }

  return {
    title: "Start with the expensive-risk question first",
    body:
      "If you are not sure where to begin, first check whether any project creates a panel, contractor, or sequencing risk. That is where bad decisions get expensive.",
    href: "/panel-checker",
    cta: "Start with Panel Checker",
    next: [
      "If you have a contractor quote, sanity-check the expensive parts first.",
      "If equipment is old, plan the replacement path before it fails.",
      "If your goal is savings, compare rates before assuming a project pencils out.",
    ],
  };
}

export default function ProjectStarterPage() {
  const [project, setProject] = useState<Project>("not-sure");
  const [trigger, setTrigger] = useState<Trigger>("curious");
  const [goal, setGoal] = useState<Goal>("avoid-mistake");

  const result = useMemo(() => recommendation(project, trigger, goal), [project, trigger, goal]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <Link href="/" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">
          ← Back to home
        </Link>
        <div className="mt-6 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
            Project Starter
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            What should you electrify first?
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Answer three plain-English questions. We’ll point you to the best next tool, guide, or contractor question without asking for your email.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <div className="space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-zinc-200">1. What are you considering?</span>
                <select
                  value={project}
                  onChange={(event) => setProject(event.target.value as Project)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                >
                  {projectOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-zinc-200">2. What triggered this?</span>
                <select
                  value={trigger}
                  onChange={(event) => setTrigger(event.target.value as Trigger)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-zinc-200">3. What are you trying to do?</span>
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as Goal)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                >
                  {goalOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-200">Recommended next step</p>
            <h2 className="mt-3 text-2xl font-black text-white">{result.title}</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-200">{result.body}</p>
            <Link
              href={result.href}
              className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-zinc-950 hover:bg-emerald-300"
            >
              {result.cta}
            </Link>
            <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/70 p-4">
              <h3 className="font-bold text-white">What to do next</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {result.next.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <FeedbackWidget
            toolId="project_starter"
            resultType={result.title}
            source="project_starter_page"
          />
        </div>
      </section>
    </main>
  );
}
