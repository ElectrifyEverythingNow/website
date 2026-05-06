import Image from "next/image";

interface HeaderProps {
  calcCount: number | null;
}

const SHARE_URL = "https://electrifyeverythingnow.com/solar";
const SHARE_TEXT = "Balcony solar is moving fast in the US — check if plug-in solar might make sense for your home";

export function Header({ calcCount }: HeaderProps) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;

  return (
    <header className="w-full">
      <div className="bg-gradient-to-b from-sky-50 to-white pt-6 pb-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <Image
            src="/solar-plug-hero.svg"
            alt="Three solar panels connected to a 120V wall outlet with a smiling sun"
            width={400}
            height={176}
            priority
            className="w-full max-w-sm h-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Balcony Solar Calculator
          </h1>
          <p className="text-lg text-zinc-500 mt-2 max-w-2xl">
            See if plug-in solar makes sense for you, then check the fast-changing state rules before buying anything.
          </p>

          {/* Counter + Share row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            {calcCount != null && (
              <span className="text-sm font-semibold text-zinc-500 bg-zinc-100 rounded-full px-4 py-1.5">
                {calcCount.toLocaleString()} calculations run
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Share:</span>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                aria-label="Share on Twitter"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-600">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-600">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                aria-label="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-600">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-5 flex flex-col items-center animate-bounce">
            <span className="text-xs text-zinc-400 mb-1">Click a state to start</span>
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
