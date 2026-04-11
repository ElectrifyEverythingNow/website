import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balcony Solar Calculator | ElectrifyEverythingNow",
  description:
    "See if plug-in balcony solar makes financial sense for your home. Free calculator with local utility rates, tilt angles, and real payback estimates.",
  openGraph: {
    title: "Balcony Solar Calculator — Does Plug-In Solar Make Sense for You?",
    description:
      "Free calculator: pick your state, choose your utility, select your tilt angle, and get an instant payback estimate. No signup required.",
    url: "https://electrifyeverythingnow.com/solar",
    siteName: "ElectrifyEverythingNow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Balcony Solar Calculator — Does Plug-In Solar Make Sense for You?",
    description:
      "Free calculator: pick your state, select your tilt angle, and get an instant payback estimate. No signup.",
  },
};

export default function SolarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
