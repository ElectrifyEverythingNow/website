import { LegislationComparisonTable } from "./LegislationComparisonTable";
import { StateLinksGrid } from "./StateLinksGrid";

export function EducationalContent() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
        {/* What Is Balcony Solar */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            What Is Balcony Solar?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Balcony solar — also called plug-in solar, portable solar, or
            microinverter solar — is a small photovoltaic system (typically 1 to
            4 panels) that plugs directly into a standard 120-volt household
            outlet. Unlike traditional rooftop solar, balcony solar requires no
            roof access, no electrical panel modifications, and no professional
            installation in most cases. Systems are capped at 1,200 watts by all
            current U.S. legislation and must carry UL 3700 safety certification.
          </p>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            How Does Plug-In Solar Work?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Each panel includes a built-in microinverter that converts DC
            electricity from the solar cells into AC electricity compatible with
            your home wiring. When you plug the panel into a wall outlet, the
            generated power flows into your home&apos;s circuits and offsets
            whatever appliances are consuming electricity at that moment. Your
            utility meter slows down (or spins backward, depending on your meter
            type), reducing your electricity bill. All UL-certified panels
            include anti-islanding protection that automatically shuts the system
            down during a power outage, protecting utility line workers.
          </p>
        </div>

        {/* Who It's For */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Who Can Use Balcony Solar Panels?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Plug-in solar is designed for people who cannot install traditional
            rooftop systems: apartment renters, condo owners, townhouse
            residents, and anyone with limited roof access or HOA restrictions.
            Panels can be placed on balconies, patios, porches, window ledges,
            fences, or in yards. Because systems are classified as personal
            property (not permanent fixtures) under most new state laws,
            landlords and HOAs generally cannot prohibit their use.
          </p>
        </div>

        {/* Legislation Overview */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Is Balcony Solar Legal in the United States?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Legality is changing rapidly. Utah became the first state to pass a
            comprehensive plug-in solar law (
            <a
              href="https://le.utah.gov/~2025/bills/static/HB0340.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              HB 340
            </a>
            ) in March 2025, with unanimous bipartisan support. Maine followed
            with{" "}
            <a
              href="https://legislature.maine.gov/legis/bills/getTestimonyDoc.asp?id=10057255"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              LD 1730
            </a>{" "}
            in April 2026, and Washington became the third state to enact
            plug-in solar legislation (HB 2296, signed into law as Chapter 136
            of the 2026 Laws). Virginia (HB 395 / SB 250), Colorado (HB 26-1007,
            up to 1,920W), and Maryland (HB 1532) have all passed legislation
            through both chambers and are awaiting governors&apos; signatures. New
            York&apos;s Senate unanimously passed the SUNNY Act 62-0. As of April
            2026, lawmakers in 33+ states and Washington D.C. have introduced
            bills to legalize plug-in solar devices. Most current legislation
            caps systems at 1,200 watts (Colorado allows up to 1,920W) and
            requires UL 3700 safety certification.
          </p>
        </div>

        {/* How Much Can You Save */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            How Much Can You Save with Plug-In Solar?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Savings depend on four factors: your local electricity rate, average
            peak sun hours, system size, and panel tilt angle. A typical 1,200W
            system costing around $2,000 can produce 1,200 to 2,000 kWh per year
            depending on location. In states with high electricity rates (like
            Connecticut at $0.30/kWh), payback can be under 4 years. In states
            with lower rates and moderate sun, payback may take 6 to 8 years.
            Over a 20-year panel lifespan, net savings typically range from
            $3,000 to $8,000. Use the calculator above to estimate your specific
            savings based on your state, utility, and setup.
          </p>
        </div>

        {/* How the Calculator Works */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            How This Calculator Works
          </h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            This calculator uses state-level peak sun hour data combined with
            your utility&apos;s electricity rate to estimate annual production
            and savings. Tilt angle adjustments account for the reduced
            efficiency of non-optimal panel angles (common on balcony railings).
            For more precise results, enter your zip code to pull
            location-specific data from the{" "}
            <a
              href="https://pvwatts.nrel.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              NREL PVWatts API
            </a>
            , the same tool used by professional solar installers. Utility rate
            data comes from the{" "}
            <a
              href="https://www.eia.gov/electricity/data/eia861/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              U.S. Energy Information Administration (EIA)
            </a>
            .
          </p>
        </div>

        {/* Legislation Comparison Table */}
        <LegislationComparisonTable />

        {/* Explore by State */}
        <StateLinksGrid />

        {/* Sources & Last Updated */}
        <div className="border-t border-zinc-100 pt-4">
          <h3 className="text-sm font-semibold text-zinc-700 mb-2">
            Data Sources
          </h3>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>
              Solar production data:{" "}
              <a
                href="https://pvwatts.nrel.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                NREL PVWatts Calculator
              </a>
            </li>
            <li>
              Utility rates:{" "}
              <a
                href="https://www.eia.gov/electricity/data/eia861/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                EIA Form 861 (2023)
              </a>
            </li>
            <li>
              Legislation tracking:{" "}
              <a
                href="https://solarrights.org/plug-in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                Solar Rights Alliance
              </a>
              ,{" "}
              <a
                href="https://www.wri.org/insights/enabling-plug-in-solar-states"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                World Resources Institute
              </a>
            </li>
            <li>
              UL 3700 safety standard:{" "}
              <a
                href="https://www.ul.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                Underwriters Laboratories
              </a>
            </li>
          </ul>
          <p className="text-xs text-zinc-400 mt-3">
            Last updated: April 11, 2026. Legislation status is tracked as bills
            advance — check individual bill links for the most current status.
          </p>
        </div>
      </div>
    </section>
  );
}
