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
            <a href="tel:+15555550123" className="flex items-center gap-2 hover:text-white">
              <Phone size={15} /> (555) 555-0123
            </a>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="hover:text-white">
                <FacebookIcon width={18} height={18} />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <InstagramIcon width={18} height={18} />
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
