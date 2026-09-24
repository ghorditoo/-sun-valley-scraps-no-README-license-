"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Fence, Flag, Flame, Lightbulb, Droplets, Sun, Wrench } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { serviceCatalog, type ServiceCategory } from "@/data/serviceCatalog";

const ICONS: Record<ServiceCategory["icon"], typeof Fence> = {
  fence: Fence,
  flag: Flag,
  flame: Flame,
  lightbulb: Lightbulb,
  droplets: Droplets,
  sun: Sun,
  wrench: Wrench,
};

function CategoryCard({ category }: { category: ServiceCategory }) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const Icon = ICONS[category.icon];

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={`/illustrations/${category.id}.svg`}
          alt={locale === "es" ? category.nameEs : category.nameEn}
          fill
          className="object-cover"
        />
        <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow">
          <Icon size={20} />
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-900">
          {locale === "es" ? category.nameEs : category.nameEn}
        </h3>
        <p className="mt-1.5 text-sm text-stone-600">
          {locale === "es" ? category.descEs : category.descEn}
        </p>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-4 flex w-full items-center justify-between rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
        >
          {open ? t.catalog.hideServices : t.catalog.viewServices}
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <ul className="mt-4 space-y-3 border-t border-brand-100 pt-4">
            {category.items.map((item) => (
              <li key={item.en}>
                <p className="text-sm font-semibold text-stone-800">
                  {locale === "es" ? item.es : item.en}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  {locale === "es" ? item.detailEs : item.detailEn}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ServiceCatalog() {
  const { t } = useLanguage();

  return (
    <section id="catalog" className="bg-gradient-to-b from-orange-100 to-brand-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.catalog.heading}</h2>
          <p className="mt-3 text-stone-600">{t.catalog.subheading}</p>
          <p className="mt-2 text-xs italic text-stone-400">{t.catalog.photoNote}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCatalog.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

