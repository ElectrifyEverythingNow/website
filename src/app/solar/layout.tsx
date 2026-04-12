import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Balcony Solar Calculator — Is Plug-In Solar Worth It? Free Savings Estimate",
  description:
    "Free balcony solar calculator for renters and homeowners. Estimate plug-in solar panel savings by state, compare utility rates, check legislation status, and get real payback numbers. No signup required.",
  keywords: [
    "balcony solar calculator",
    "plug-in solar panels",
    "apartment solar panels",
    "renter solar",
    "balcony solar savings",
    "plug-in solar payback",
    "is balcony solar worth it",
    "solar panel for apartment",
    "portable solar panels",
    "balcony solar legislation",
  ],
  alternates: {
    canonical: "https://electrifyeverythingnow.com/solar",
  },
  openGraph: {
    title:
      "Balcony Solar Calculator — Does Plug-In Solar Make Sense for You?",
    description:
      "Free calculator: pick your state, choose your utility, select your tilt angle, and get an instant payback estimate for plug-in balcony solar panels. No signup required.",
    url: "https://electrifyeverythingnow.com/solar",
    siteName: "ElectrifyEverythingNow",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Balcony Solar Calculator by ElectrifyEverythingNow — free plug-in solar savings estimator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Balcony Solar Calculator — Does Plug-In Solar Make Sense for You?",
    description:
      "Free calculator: pick your state, select your tilt angle, and get an instant payback estimate for plug-in solar. No signup.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Balcony Solar Calculator",
      description:
        "Free calculator to estimate plug-in balcony solar panel savings. Select your state, utility, system size, and tilt angle to get payback estimates powered by NREL PVWatts data.",
      url: "https://electrifyeverythingnow.com/solar",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "ElectrifyEverythingNow",
        url: "https://electrifyeverythingnow.com",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is balcony solar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Balcony solar (also called plug-in solar) consists of small, portable solar panels — typically 1 to 4 panels — that connect directly to a standard 120V household outlet. They are designed for renters, apartment dwellers, and anyone without roof access. Systems are capped at 1,200 watts and require UL certification for safety.",
          },
        },
        {
          "@type": "Question",
          name: "Is balcony solar legal in my state?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "As of April 2026, Utah and Maine have signed plug-in solar into law. Virginia and Colorado have passed legislation through their legislatures. Over 28 states have introduced bills to legalize plug-in solar. Check the legislation tracker on this page for your state's status.",
          },
        },
        {
          "@type": "Question",
          name: "How much can I save with plug-in solar panels?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Savings depend on your electricity rate, sun hours, system size, and panel tilt angle. A typical 1,200W system costing $2,000 can pay for itself in 3 to 8 years depending on location, and save $200 to $500 per year on electricity bills. Use our free calculator to estimate your specific savings.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need permission from my utility to install plug-in solar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In states with enacted plug-in solar legislation (Utah, Maine), no utility approval is required — only a simple notification in some cases. In states without specific legislation, utility policies vary. All current bills are designed to remove the interconnection approval requirement for systems under 1,200 watts.",
          },
        },
        {
          "@type": "Question",
          name: "Are plug-in solar panels safe?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All plug-in solar legislation requires UL 3700 certification, which includes anti-islanding protection that automatically shuts panels down during power outages to protect utility line workers. Systems connect through standard outlets and do not require electrical panel modifications.",
          },
        },
      ],
    },
  ],
};

export default function SolarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
