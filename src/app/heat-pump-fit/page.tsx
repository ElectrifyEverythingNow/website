"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeedbackWidget } from "@/components/FeedbackWidget";

type HomeTightness = "drafty" | "average" | "tight" | "not-sure";
type HeatPumpPreset = "mitsubishi" | "daikin" | "carrier" | "mrcool" | "standard";
type ClimateProfile = {
  name: string;
  designTemp: number;
  annualHdd: number;
  hoursBelow: Record<number, number>;
};
type PerformancePoint = { temp: number; capacity: number; cop: number };

const climateProfiles: ClimateProfile[] = [
  {
    name: "Very cold / Upper Midwest / Mountain cold",
    designTemp: -5,
    annualHdd: 7200,
    hoursBelow: { 30: 4300, 25: 3300, 20: 2350, 15: 1600, 10: 1000, 5: 610, 0: 330, [-5]: 145, [-10]: 55, [-15]: 18 },
  },
  {
    name: "Cold / Northeast / Rockies / Great Lakes",
    designTemp: 5,
    annualHdd: 5600,
    hoursBelow: { 30: 3500, 25: 2600, 20: 1800, 15: 1120, 10: 640, 5: 310, 0: 125, [-5]: 35, [-10]: 8, [-15]: 2 },
  },
  {
    name: "Mixed-cold / Mid-Atlantic / Front Range",
    designTemp: 12,
    annualHdd: 4500,
    hoursBelow: { 30: 2700, 25: 1950, 20: 1240, 15: 690, 10: 330, 5: 125, 0: 40, [-5]: 9, [-10]: 1, [-15]: 0 },
  },
  {
    name: "Mild / Pacific coast / Southeast shoulder climates",
    designTemp: 25,
    annualHdd: 2600,
    hoursBelow: { 30: 1250, 25: 700, 20: 320, 15: 125, 10: 42, 5: 12, 0: 2, [-5]: 0, [-10]: 0, [-15]: 0 },
  },
  {
    name: "Warm / low heating load",
    designTemp: 35,
    annualHdd: 1000,
    hoursBelow: { 30: 260, 25: 110, 20: 42, 15: 12, 10: 3, 5: 0, 0: 0, [-5]: 0, [-10]: 0, [-15]: 0 },
  },
];

const zipHints: { prefixes: string[]; profileIndex: number }[] = [
  { prefixes: ["04", "05", "12", "13", "14", "49", "54", "55", "56", "58", "59", "82"], profileIndex: 0 },
  { prefixes: ["01", "02", "03", "06", "07", "08", "10", "11", "15", "16", "17", "18", "19", "20", "21", "44", "48", "50", "51", "52", "53", "57", "60", "61", "62", "63", "64", "68", "69", "80", "81", "83", "84", "85", "97"], profileIndex: 1 },
  { prefixes: ["22", "23", "24", "25", "26", "27", "28", "29", "37", "38", "40", "41", "42", "43", "45", "46", "47", "66", "67", "75", "76", "77", "78", "79", "86", "87", "88", "89"], profileIndex: 2 },
  { prefixes: ["30", "31", "32", "33", "34", "35", "36", "39", "70", "71", "72", "73", "74", "90", "91", "92", "93", "94", "95", "96"], profileIndex: 3 },
  { prefixes: ["00", "98", "99"], profileIndex: 4 },
];

const heatPumps: Record<HeatPumpPreset, { label: string; short: string; points: PerformancePoint[]; note: string }> = {
  mitsubishi: {
    label: "Mitsubishi Hyper-Heating style cold-climate ductless",
    short: "Premium cold-climate ductless",
    note: "Strong capacity retention. Use exact submittals/NEEP data for a real quote.",
    points: [
      { temp: 47, capacity: 1.0, cop: 4.0 },
      { temp: 17, capacity: 1.0, cop: 2.6 },
      { temp: 5, capacity: 0.95, cop: 2.2 },
      { temp: -5, capacity: 0.85, cop: 1.8 },
      { temp: -13, capacity: 0.75, cop: 1.5 },
    ],
  },
  daikin: {
    label: "Daikin Aurora style cold-climate ductless",
    short: "Premium cold-climate ductless",
    note: "Similar planning preset to other premium cold-climate mini-splits.",
    points: [
      { temp: 47, capacity: 1.0, cop: 3.9 },
      { temp: 17, capacity: 0.98, cop: 2.55 },
      { temp: 5, capacity: 0.94, cop: 2.15 },
      { temp: -5, capacity: 0.84, cop: 1.75 },
      { temp: -13, capacity: 0.74, cop: 1.45 },
    ],
  },
  carrier: {
    label: "Carrier / Bryant variable-speed cold-climate ducted",
    short: "Premium cold-climate ducted",
    note: "Ducted systems depend heavily on the matched indoor unit, ducts, and airflow.",
    points: [
      { temp: 47, capacity: 1.0, cop: 3.6 },
      { temp: 17, capacity: 0.95, cop: 2.4 },
      { temp: 5, capacity: 0.85, cop: 2.0 },
      { temp: -5, capacity: 0.75, cop: 1.6 },
      { temp: -13, capacity: 0.65, cop: 1.35 },
    ],
  },
  mrcool: {
    label: "MrCool / budget DIY cold-climate inverter",
    short: "Budget cold-climate inverter",
    note: "Useful for planning, but exact DIY model specs vary a lot.",
    points: [
      { temp: 47, capacity: 1.0, cop: 3.4 },
      { temp: 17, capacity: 0.9, cop: 2.25 },
      { temp: 5, capacity: 0.85, cop: 1.85 },
      { temp: -5, capacity: 0.75, cop: 1.5 },
      { temp: -13, capacity: 0.65, cop: 1.3 },
    ],
  },
  standard: {
    label: "Standard non-cold-climate heat pump",
    short: "Standard heat pump baseline",
    note: "Included as a comparison. Many standard units need more backup heat in cold weather.",
    points: [
      { temp: 47, capacity: 1.0, cop: 3.2 },
      { temp: 17, capacity: 0.65, cop: 2.0 },
      { temp: 5, capacity: 0.45, cop: 1.5 },
      { temp: -5, capacity: 0.25, cop: 1.2 },
      { temp: -13, capacity: 0.15, cop: 1.05 },
    ],
  },
};

const tightnessLabels: Record<HomeTightness, { label: string; designBtuPerSqft: number; note: string }> = {
  drafty: { label: "Older / drafty", designBtuPerSqft: 28, note: "Higher heat loss. Air sealing may matter as much as equipment choice." },
  average: { label: "Average", designBtuPerSqft: 20, note: "Typical planning assumption for many existing homes." },
  tight: { label: "Tighter / updated", designBtuPerSqft: 14, note: "Lower heat loss. Better odds a smaller system covers cold hours." },
  "not-sure": { label: "I’m not sure", designBtuPerSqft: 22, note: "We use a slightly conservative average until you have a load calculation." },
};

function inferClimate(zip: string) {
  const prefix = zip.trim().slice(0, 2);
  const match = zipHints.find((hint) => hint.prefixes.includes(prefix));
  return climateProfiles[match?.profileIndex ?? 2];
}

function interpolate(points: PerformancePoint[], temp: number, key: "capacity" | "cop") {
  const sorted = [...points].sort((a, b) => a.temp - b.temp);
  if (temp <= sorted[0].temp) return sorted[0][key];
  if (temp >= sorted[sorted.length - 1].temp) return sorted[sorted.length - 1][key];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const low = sorted[i];
    const high = sorted[i + 1];
    if (temp >= low.temp && temp <= high.temp) {
      const ratio = (temp - low.temp) / (high.temp - low.temp);
      return low[key] + ratio * (high[key] - low[key]);
    }
  }
  return sorted[0][key];
}

function loadAtTemp(designLoad: number, indoorTemp: number, designTemp: number, temp: number) {
  if (temp >= indoorTemp) return 0;
  const denominator = indoorTemp - designTemp;
  if (denominator <= 0) return designLoad;
  return Math.max(0, designLoad * ((indoorTemp - temp) / denominator));
}

function hoursBelowTemp(profile: ClimateProfile, temp: number) {
  const points = Object.entries(profile.hoursBelow)
    .map(([key, value]) => ({ temp: Number(key), hours: value }))
    .sort((a, b) => a.temp - b.temp);
  if (temp <= points[0].temp) return points[0].hours;
  if (temp >= points[points.length - 1].temp) return points[points.length - 1].hours;
  for (let i = 0; i < points.length - 1; i += 1) {
    const low = points[i];
    const high = points[i + 1];
    if (temp >= low.temp && temp <= high.temp) {
      const ratio = (temp - low.temp) / (high.temp - low.temp);
      return Math.round(low.hours + ratio * (high.hours - low.hours));
    }
  }
  return 0;
}

function findChallengeTemp(designLoad: number, capacity47: number, profile: ClimateProfile, preset: HeatPumpPreset) {
  for (let temp = 47; temp >= -15; temp -= 1) {
    const available = capacity47 * interpolate(heatPumps[preset].points, temp, "capacity");
    const load = loadAtTemp(designLoad, 70, profile.designTemp, temp);
    if (available < load) return temp;
  }
  return null;
}

function formatBtu(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000).toLocaleString()}k BTU/hr`;
  return `${Math.round(value).toLocaleString()} BTU/hr`;
}

function resultTone(challengeHours: number, designCoverage: number) {
  if (designCoverage >= 1.1 && challengeHours < 50) {
    return {
      label: "Looks strong",
      color: "emerald",
      summary: "This setup probably covers nearly all normal heating hours in this rough model.",
    };
  }
  if (designCoverage >= 0.9 && challengeHours < 300) {
    return {
      label: "Close fit",
      color: "amber",
      summary: "This may work well, but sizing, ducts, backup heat, and weather extremes matter.",
    };
  }
  return {
    label: "Likely challenged",
    color: "rose",
    summary: "This setup may need backup heat or a different size/model during meaningful cold-weather hours.",
  };
}

export default function HeatPumpFitPage() {
  const [zip, setZip] = useState("80516");
  const [sqft, setSqft] = useState(2000);
  const [tightness, setTightness] = useState<HomeTightness>("average");
  const [preset, setPreset] = useState<HeatPumpPreset>("mitsubishi");
  const [tons, setTons] = useState(3);

  const result = useMemo(() => {
    const profile = inferClimate(zip);
    const tightnessInfo = tightnessLabels[tightness];
    const designLoad = sqft * tightnessInfo.designBtuPerSqft;
    const capacity47 = tons * 12000;
    const capacityAtDesign = capacity47 * interpolate(heatPumps[preset].points, profile.designTemp, "capacity");
    const copAtDesign = interpolate(heatPumps[preset].points, profile.designTemp, "cop");
    const designCoverage = capacityAtDesign / designLoad;
    const challengeTemp = findChallengeTemp(designLoad, capacity47, profile, preset);
    const challengeHours = challengeTemp === null ? 0 : hoursBelowTemp(profile, challengeTemp);
    const tone = resultTone(challengeHours, designCoverage);
    const backupBtuAtDesign = Math.max(0, designLoad - capacityAtDesign);
    const checkpoints = [47, 30, 17, 5, profile.designTemp, -5].filter((value, index, arr) => arr.indexOf(value) === index);

    return {
      profile,
      tightnessInfo,
      designLoad,
      capacity47,
      capacityAtDesign,
      copAtDesign,
      designCoverage,
      challengeTemp,
      challengeHours,
      tone,
      backupBtuAtDesign,
      checkpoints: checkpoints.map((temp) => ({
        temp,
        capacity: capacity47 * interpolate(heatPumps[preset].points, temp, "capacity"),
        cop: interpolate(heatPumps[preset].points, temp, "cop"),
        load: loadAtTemp(designLoad, 70, profile.designTemp, temp),
      })),
    };
  }, [zip, sqft, tightness, preset, tons]);

  const toneClasses = {
    emerald: "border-emerald-300 bg-emerald-400/15 text-emerald-100",
    amber: "border-amber-300 bg-amber-400/15 text-amber-100",
    rose: "border-rose-300 bg-rose-400/15 text-rose-100",
  }[result.tone.color];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.20),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <Link href="/" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">← Back to home</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-sm font-bold text-emerald-200">
                New tool: heat pump cold-weather fit
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
                Will a heat pump keep your house warm where you live?
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Enter a ZIP code, rough square footage, home tightness, and a quoted heat pump size. We estimate how many hours per year the system may be challenged.
              </p>
            </div>
            <div className={`rounded-3xl border p-6 shadow-2xl ${toneClasses}`}>
              <p className="text-sm font-black uppercase tracking-wide">Rough result</p>
              <h2 className="mt-3 text-4xl font-black">{result.tone.label}</h2>
              <p className="mt-3 text-base leading-7">{result.tone.summary}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-75">Challenged hours</p>
                  <p className="mt-1 text-3xl font-black">{result.challengeHours.toLocaleString()}</p>
                  <p className="text-xs opacity-80">hours/year</p>
                </div>
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-75">Design coverage</p>
                  <p className="mt-1 text-3xl font-black">{Math.round(result.designCoverage * 100)}%</p>
                  <p className="text-xs opacity-80">at {result.profile.designTemp}°F</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
          <h2 className="text-2xl font-black">Four simple inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">This is not a Manual J. It is a quick screen to help you ask better contractor questions.</p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-200">ZIP code</span>
              <input value={zip} onChange={(event) => setZip(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300" placeholder="80516" inputMode="numeric" />
              <span className="mt-1 block text-xs text-slate-500">Used only to pick a rough climate profile for now.</span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-200">Approximate heated square footage</span>
              <input value={sqft} onChange={(event) => setSqft(Number(event.target.value) || 0)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300" type="number" min="300" max="7000" step="100" />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-200">How tight is the house?</span>
              <select value={tightness} onChange={(event) => setTightness(event.target.value as HomeTightness)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300">
                {Object.entries(tightnessLabels).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-200">Heat pump family</span>
              <select value={preset} onChange={(event) => setPreset(event.target.value as HeatPumpPreset)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300">
                {Object.entries(heatPumps).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-200">Quoted heat pump size</span>
              <select value={tons} onChange={(event) => setTons(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300">
                {[1.5, 2, 2.5, 3, 3.5, 4, 5].map((value) => <option key={value} value={value}>{value} tons ({formatBtu(value * 12000)} at 47°F)</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-300">Your cold-weather screen</p>
                <h2 className="mt-2 text-3xl font-black">{result.challengeHours.toLocaleString()} hours/year may challenge this setup</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                Climate: <span className="font-bold text-white">{result.profile.name}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated heat loss</p>
                <p className="mt-2 text-2xl font-black">{formatBtu(result.designLoad)}</p>
                <p className="mt-1 text-xs text-slate-400">at {result.profile.designTemp}°F outdoor temp</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Heat pump output</p>
                <p className="mt-2 text-2xl font-black">{formatBtu(result.capacityAtDesign)}</p>
                <p className="mt-1 text-xs text-slate-400">estimated at design temp</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">COP when very cold</p>
                <p className="mt-2 text-2xl font-black">{result.copAtDesign.toFixed(1)}</p>
                <p className="mt-1 text-xs text-slate-400">rough efficiency at design temp</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-300">
                <span>Covered by heat pump</span>
                <span>{Math.round(Math.min(result.designCoverage, 1) * 100)}%</span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${Math.min(100, Math.round(result.designCoverage * 100))}%` }} />
              </div>
              {result.backupBtuAtDesign > 0 ? (
                <p className="mt-3 text-sm text-amber-200">At the rough design temperature, this model estimates about {formatBtu(result.backupBtuAtDesign)} of backup or extra capacity may be needed.</p>
              ) : (
                <p className="mt-3 text-sm text-emerald-200">At the rough design temperature, the selected heat pump appears to cover the estimated load.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-black">Temperature-by-temperature view</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="px-4 py-3">Outdoor temp</th><th className="px-4 py-3">Home needs</th><th className="px-4 py-3">Heat pump can deliver</th><th className="px-4 py-3">COP</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {result.checkpoints.map((row) => (
                    <tr key={row.temp} className={row.capacity >= row.load ? "text-slate-200" : "bg-amber-500/10 text-amber-100"}>
                      <td className="px-4 py-3 font-bold">{row.temp}°F</td>
                      <td className="px-4 py-3">{formatBtu(row.load)}</td>
                      <td className="px-4 py-3">{formatBtu(row.capacity)}</td>
                      <td className="px-4 py-3">{row.cop.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Performance presets are simplified from manufacturer-published/NEEP-style 47°F, 17°F, 5°F, -5°F, and -13°F planning points. Exact model pairings vary.</p>
          </section>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">What to ask the contractor</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Did you run a room-by-room Manual J or use a rule of thumb?</li>
            <li>• What is the exact outdoor unit and indoor unit pairing?</li>
            <li>• What is its output at 17°F, 5°F, and my local design temperature?</li>
            <li>• What backup heat is included, and when will it run?</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">How to make it easier</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Air seal obvious drafts before sizing equipment.</li>
            <li>• Fix bad ducts or airflow before blaming the heat pump.</li>
            <li>• Ask for cold-climate models if you live where winter nights drop below 15°F.</li>
            <li>• Compare one large ducted system with targeted ductless heads if some rooms are hard to heat.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">Important caveat</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">This is a screening tool, not HVAC design. Real sizing should use local weather data, a Manual J load calculation, duct inspection, room-by-room comfort needs, and exact submittal data.</p>
          <p className="mt-4 text-sm font-bold text-emerald-300">Independent planning guidance. No contractor steering.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950">
          <FeedbackWidget toolId="heat_pump_fit" resultType={result.tone.label} source="heat_pump_fit_page" title="Help improve this heat pump tool" />
        </div>
      </section>
    </main>
  );
}
