import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrical Panel Checker | ElectrifyEverythingNow",
  description:
    "Upload your electrical panel photo. See if it can handle home electrification — and what cheaper options to ask about before approving an expensive upgrade.",
  openGraph: {
    title: "Electrical Panel Checker — ElectrifyEverythingNow",
    description:
      "Upload your panel. See cheaper options before you approve a panel upgrade.",
    url: "https://electrifyeverythingnow.com/panel-checker",
    siteName: "ElectrifyEverythingNow",
    type: "website",
  },
};

export default function PanelCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
