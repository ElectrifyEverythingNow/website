"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeedbackWidget } from "@/components/FeedbackWidget";

type Project =
  | "roadmap"
  | "panel"
  | "heat-pump"
  | "hpwh"
  | "balcony-solar"
  | "ev-charging"
  | "post-install-rates"
  | "not-sure";

type Trigger = "quote" | "old-equipment" | "bills" | "comfort" | "climate" | "new-ev" | "curious";

type Goal = "avoid-mistake" | "plan-sequence" | "ask-contractor" | "save-money" | "check-rules";

const projectOptions: { value: Project; label: string }[] = [
  { value: "roadmap", label: "I want a roadmap for what to electrify first" },
  { value: "heat-pump", label: "I want a heat pump" },
  { value: "hpwh", label: "I want a heat pump water heater" },
  { value: "panel", label: "I was told I need a panel upgrade" },
  { value: "ev-charging", label: "I want EV charging" },
  { value: "balcony-solar", label: "I want balcony or plug-in solar" },
  { value: "post-install-rates", label: "I already electrified something and want to optimize rates" },
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
  if (project === "roadmap" || project === "not-sure" || goal === "plan-sequence" || goal === "save-money") {
    return {
      title: "Start with an electrification roadmap, not rates",
      body:
        "The first decision is usually project order. Start with the upgrades most likely to cut fossil-fuel use and bills: heat pump HVAC, heat pump water heater, smart panel/EV planning, then smaller projects. Rate optimization is useful after you know what loads you are adding.",
      href: "#roadmap-questions",
      cta: "Refine my roadmap below",
      next: [
        "Prioritize big fuel-switching loads first: space heating, water heating, and driving.",
        "Check panel risk before approving expensive electrical work.",
        "Use balcony solar as its own separate tool because rules and site conditions matter more than sequencing.",
        "Come back to the Rate Optimizer after a heat pump, EV, battery, or solar install is likely.",
      ],
    };
  }

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

  if (project === "balcony-solar") {
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

  if (project === "post-install-rates") {
    return {
      title: "Use the Rate Optimizer after the project is defined",
      body:
        "Rates are important, but they are usually a second-step decision. Use this after a heat pump, EV charger, battery, or solar install is likely so you can compare plans against your future load shape.",
      href: "/rates",
      cta: "Open Rate Optimizer",
      next: [
        "First decide what you are installing and roughly when it will run.",
        "Then compare time-of-use windows, EV plans, solar export rules, and battery options.",
        "Use this as planning guidance, then verify with your utility.",
      ],
    };
  }

  if (project === "heat-pump") {
    return {
      title: "Use the Heat Pump Cold-Weather Fit Checker",
      body:
        "Start by checking whether a quoted heat pump size and model family is likely to keep up in your climate. The tool estimates the cold-weather hours when the system may be challenged, then gives contractor questions about sizing, backup heat, and exact model performance.",
      href: "/heat-pump-fit",
      cta: "Check heat pump fit",
      next: [
        "Use ZIP code, rough square footage, home tightness, quoted tons, and heat pump family.",
        "Ask whether the quote includes a Manual J, exact low-temperature capacity, backup heat, and electrical scope.",
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
    title: "Start with the highest-savings roadmap",
    body:
      "If you are not sure where to begin, prioritize the projects most likely to change household energy use first: space heating, water heating, driving, then cooking and smaller loads. Check panel risk before approving expensive electrical work.",
    href: "#roadmap-questions",
    cta: "Refine my roadmap below",
    next: [
      "Start with large fossil-fuel loads: heat pump HVAC and heat pump water heater.",
      "If you drive or plan to, evaluate EV charging without assuming a panel upgrade.",
      "Treat balcony solar as its own rule-and-site-specific tool, not the core roadmap.",
    ],
  };
}

export default function ProjectStarterPage() {
  const [project, setProject] = useState<Project>("roadmap");
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
            Answer three plain-English questions. We’ll start with a rough roadmap based on likely energy savings and expensive-mistake risk, then point you to the best tool or contractor question.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["1", "Heat pump HVAC", "Usually the biggest home energy and comfort lever if you heat with gas, propane, oil, or resistance electric."],
            ["2", "Heat pump water heater", "Often a strong savings project and easier if planned before emergency replacement."],
            ["3", "Panel + EV readiness", "Avoid overspending by checking load management and right-sized charging before upgrades."],
            ["Later", "Rates and balcony solar", "Optimize rates after new loads are clear. Treat balcony solar as a standalone rules-and-sun tool."],
          ].map(([rank, title, text]) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-300">{rank}</p>
              <h2 className="mt-2 font-extrabold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section id="roadmap-questions" className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
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
