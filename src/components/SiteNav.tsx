"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 text-white py-2 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold text-green-400 hover:text-green-300"
        >
          ElectrifyEverythingNow
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/solar"
            className={`hover:text-green-300 ${
              pathname === "/solar" ? "text-green-400 font-semibold" : "text-zinc-300"
            }`}
          >
            Solar Calculator
          </Link>
          <Link
            href="/rates"
            className={`hover:text-green-300 ${
              pathname === "/rates" ? "text-green-400 font-semibold" : "text-zinc-300"
            }`}
          >
            Rate Optimizer
          </Link>
          <Link
            href="/panel-checker"
            className={`hover:text-green-300 ${
              pathname === "/panel-checker" ? "text-green-400 font-semibold" : "text-zinc-300"
            }`}
          >
            Panel Checker
          </Link>
          <Link
            href="/solar/how-to-install"
            className={`hover:text-green-300 ${
              pathname === "/solar/how-to-install" ? "text-green-400 font-semibold" : "text-zinc-300"
            }`}
          >
            Install Guide
          </Link>
        </div>
      </div>
    </nav>
  );
}
