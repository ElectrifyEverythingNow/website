import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install Guides | ElectrifyEverythingNow",
  description:
    "Step-by-step homeowner install guides for electrification — plug-in solar, heat pumps, EV chargers, and more.",
  alternates: {
    canonical: "https://electrifyeverythingnow.com/install-guide",
  },
};

export default function InstallGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
