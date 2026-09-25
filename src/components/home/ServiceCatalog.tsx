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
    <article className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-[0_12px_35px_-20px_rgba(28,25,23,0.45)] transition-[transform,box-shadow] duration-500 [transform-style:preserve-3d] hover:[transform:perspective(1200px)_rotateX(1.5deg)_rotateY(-1.5deg)_translateY(-8px)] hover:shadow-[0_28px_55px_-24px_rgba(6,78,59,0.45)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
        <Image
          src={category.coverImage}
          alt={locale === "es" ? category.nameEs : category.nameEn}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover saturate-[1.08] contrast-[1.06] transition duration-700 ease-out group-hover:scale-[1.08] group-hover:saturate-[1.16]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_35%,rgba(6,78,59,0.76)_100%)]" />
        <div className="absolute inset-0 opacity-50 mix-blend-soft-light bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.55),transparent_32%)]" />
        <div className="absolute inset-3 rounded-md border border-white/25 shadow-[inset_0_0_40px_rgba(0,0,0,0.12)]" />
        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90 text-brand-800 shadow-lg backdrop-blur">
          <Icon size={21} strokeWidth={1.8} />
        </span>
        <h3 className="absolute bottom-4 left-5 right-5 text-xl font-bold leading-tight text-white drop-shadow-lg">
          {locale === "es" ? category.nameEs : category.nameEn}
        </h3>
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed text-stone-600">
          {locale === "es" ? category.descEs : category.descEn}
        </p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 flex w-full items-center justify-between rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-500 hover:bg-brand-50"
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
    </article>
  );
}

export function ServiceCatalog() {
  const { t } = useLanguage();

  return (
    <section id="catalog" className="bg-stone-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.catalog.heading}</h2>
          <p className="mt-3 text-stone-600">{t.catalog.subheading}</p>
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

