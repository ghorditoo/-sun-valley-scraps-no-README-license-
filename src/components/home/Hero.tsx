"use client";

import { ArrowRight, Images, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";

export function Hero() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-100 via-orange-50 to-orange-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <ShieldCheck size={14} />
            {t.hero.trustBadge}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg text-stone-600">{t.hero.subtitle}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => openBooking()}
              className="flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-800"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={16} />
            </button>
            <a
              href="#gallery"
              className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-brand-600 hover:text-brand-700"
            >
              <Images size={16} />
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

