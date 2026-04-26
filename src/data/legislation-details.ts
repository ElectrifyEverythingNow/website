export interface LawEntry {
  state: string;
  stateCode: string;
  status: "signed" | "passed" | "introduced";
  bill: string;
  billUrl: string;
  summary: string;
  details: string;
  sourceLabel: string;
  sourceUrl: string;
  maxWatts: number;
  utilityApproval: string;
  effectiveDate: string | null;
}

export const LAWS: LawEntry[] = [
  {
    state: "Utah",
    stateCode: "UT",
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
    maxWatts: 1200,
    utilityApproval: "No interconnection application required",
    effectiveDate: "2025-05-07",
  },
  {
    state: "Maine",
    stateCode: "ME",
    status: "signed",
    bill: "LD 1730",
    billUrl:
      "https://legislature.maine.gov/legis/bills/getTestimonyDoc.asp?id=10057255",
    summary:
      "Signed by Governor Mills on April 6, 2026. Effective July 2026. Creates two tiers based on system output.",
    details:
      "Systems \u2264420W: DIY install, no utility notification required. Systems 421\u20131,200W: licensed electrician install, utility notification within 30 days. All devices must meet UL 3700 certification. Could save the average Maine household ~$388/year.",
    sourceLabel: "pv magazine USA",
    sourceUrl:
      "https://pv-magazine-usa.com/2026/04/03/maine-becomes-third-state-to-pass-plug-in-solar-legislation/",
    maxWatts: 1200,
    utilityApproval: "No notification required for systems 420W or under; utility notification within 30 days for 421-1200W",
    effectiveDate: "2026-04-06",
  },
  {
    state: "Washington",
    stateCode: "WA",
    status: "signed",
    bill: "HB 2296",
    billUrl: "https://app.leg.wa.gov/billsummary?BillNumber=2296&Year=2025",
    summary:
      "Signed into law as Chapter 136 of the 2026 Laws. Effective June 11, 2026. Third state to enact plug-in solar legislation in 2026.",
    details:
      "Passed the House February 11, 2026 and the Senate March 6, 2026. Senate amendments stripped meter-mounted device language. Improves home solar economics broadly while creating a pathway for plug-in devices.",
    sourceLabel: "Washington State Legislature",
    sourceUrl:
      "https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Bill%20Reports/House/2296-S%20HBR%20APH%2026.pdf",
    maxWatts: 1200,
    utilityApproval: "Streamlined — no separate interconnection agreement",
    effectiveDate: "2026-06-11",
  },
  {
    state: "Virginia",
    stateCode: "VA",
    status: "passed",
    bill: "HB 395 / SB 250",
    billUrl:
      "https://virginiamercury.com/2026/03/10/plug-in-solar-panels-near-approval-by-general-assembly/",
    summary:
      "Passed General Assembly March 2026 with overwhelming bipartisan support. Gov. Spanberger returned with technical amendments — special session approval expected. Effective Jan 1, 2027.",
    details:
      "Allows portable solar devices up to 1,200W per dwelling. Utilities cannot charge fees or require approval — only notification. Landlords with 4+ units cannot ban tenant use. Classified as consumer goods under the Virginia Consumer Protection Act. Part of Spanberger's Affordable Virginia Agenda.",
    sourceLabel: "Utility Dive",
    sourceUrl:
      "https://www.utilitydive.com/news/virginia-legislature-passes-balcony-solar-bill/814582/",
    maxWatts: 1200,
    utilityApproval: "Notification only — no fees or prior approval",
    effectiveDate: "2027-01-01",
  },
  {
    state: "Colorado",
    stateCode: "CO",
    status: "passed",
    bill: "HB 26-1007",
    billUrl: "https://leg.colorado.gov/bills/HB26-1007",
    summary:
      "Passed legislature April 14, 2026. Awaiting Gov. Polis signature (expected to sign). Highest wattage cap of any state at 1,920W.",
    details:
      "Two-tier system: 1,920W with electrician + dedicated circuit, or 395W plug-and-play (no electrician, permit, or building code compliance). Classifies plug-in solar as personal property, blocking HOA and local government bans. UL 3700 required. Utilities must permit customer-owned meter collar adapters by Dec 31, 2026.",
    sourceLabel: "Colorado Sun",
    sourceUrl:
      "https://coloradosun.com/2026/04/17/plug-in-solar-balcony-solar-colorado-bill-eases-way/",
    maxWatts: 1920,
    utilityApproval: "No utility approval needed before installation",
    effectiveDate: "2027-01-01",
  },
  {
    state: "Maryland",
    stateCode: "MD",
    status: "passed",
    bill: "HB 1532 (Utility RELIEF Act)",
    billUrl:
      "https://pv-magazine-usa.com/2026/04/15/bills-containing-plug-in-solar-provisions-pass-in-maryland-and-colorado/",
    summary:
      "Passed legislature April 2026 as part of Gov. Moore's Utility RELIEF Act. Awaiting governor's signature (expected to sign). Effective Oct 1, 2026.",
    details:
      "Allows residential customers to use portable solar systems up to 1,200W per meter. Major component of Gov. Moore's legislative agenda for the 2026 session. Streamlined interconnection requirements and consumer protections.",
    sourceLabel: "pv magazine USA",
    sourceUrl:
      "https://pv-magazine-usa.com/2026/04/15/bills-containing-plug-in-solar-provisions-pass-in-maryland-and-colorado/",
    maxWatts: 1200,
    utilityApproval: "Streamlined — no separate interconnection agreement",
    effectiveDate: "2026-10-01",
  },
  {
    state: "New York",
    stateCode: "NY",
    status: "introduced",
    bill: "SUNNY Act (S 8512B / A 9111B)",
    billUrl:
      "https://www.nysenate.gov/legislation/bills/2025/S8512/amendment/original",
    summary:
      "Senate passed unanimously 62-0. Awaiting Assembly action. Sponsored by Sen. Krueger and Asm. Gallagher.",
    details:
      "Would exempt small plug-in solar from interconnection and net metering requirements. Prohibits utilities from requiring approval or fees for plug-in devices. Aims to expand solar access for the millions of New Yorkers who can't install rooftop solar.",
    sourceLabel: "NY Senate",
    sourceUrl:
      "https://www.nysenate.gov/newsroom/press-releases/2026/liz-krueger/senate-unanimously-passes-sunny-act",
    maxWatts: 1200,
    utilityApproval: "Would prohibit utilities from requiring approval or fees",
    effectiveDate: null,
  },
  {
    state: "Illinois",
    stateCode: "IL",
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
    maxWatts: 1200,
    utilityApproval: "Utility notification (not approval) required within 30 days",
    effectiveDate: null,
  },
];

export const STATUS_STYLES: Record<
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
