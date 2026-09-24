"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

// lucide-react no longer ships brand/social marks, so these are hand-rolled minimal glyphs.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 9H15V6.5h-1.9C11 6.5 10 7.6 10 9.6V11H8.5v2.5H10V21h2.6v-7.5H14.6L15 11h-2.4V9.9c0-.6.2-.9.9-.9Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x={3.5} y={3.5} width={17} height={17} rx={4.5} />
      <circle cx={12} cy={12} r={3.6} />
      <circle cx={16.8} cy={7.2} r={0.9} fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.4 2 1.8 3.6 3.8 3.9v2.7c-1.4 0-2.8-.4-3.8-1.2v6.4c0 3.1-2.5 5.2-5.3 5.2-2.9 0-5.3-2.3-5.3-5.2 0-2.9 2.4-5.2 5.3-5.2.4 0 .8 0 1.2.1v2.8a2.6 2.6 0 0 0-1.2-.3 2.5 2.5 0 1 0 2.5 2.5V3h2.8Z" />
    </svg>
  );
}

// Generic neighborhood/home glyph for Nextdoor (no brand icon shipped by lucide-react).
function NextdoorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M3.5 10.5 12 4l8.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9v9.5a1 1 0 0 0 1 1H9.5v-5h5v5h3a1 1 0 0 0 1-1V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Image src="/logos/logo-monochrome-white.svg" alt="" width={22} height={22} />
              {t.brand.name}
            </div>
            <p className="mt-2 max-w-sm text-sm text-stone-400">{t.brand.tagline}</p>
            <p className="mt-1 text-xs text-stone-500">{t.footer.familyOwned}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <a href="tel:+14807129344" className="flex items-center gap-2 hover:text-white">
              <Phone size={15} /> (480) 712-9344
            </a>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/sunvalleyscraps/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-white"
              >
                <FacebookIcon width={18} height={18} />
              </a>
              {/* Instagram link pending business account identity verification. */}
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <InstagramIcon width={18} height={18} />
              </a>
              <a
                href="https://www.tiktok.com/@sunvalleyscraps"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-white"
              >
                <TikTokIcon width={18} height={18} />
              </a>
              <a
                href="https://nextdoor.com/page/sun-valley-scraps-phoenix-az"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nextdoor"
                className="hover:text-white"
              >
                <NextdoorIcon width={18} height={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-800 pt-4 text-xs text-stone-500">
          © {year} {t.brand.name}. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
