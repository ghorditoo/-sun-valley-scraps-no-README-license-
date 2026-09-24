"use client";

import { Fence, Sprout, Droplets, Hammer, Repeat } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";
import type { ServiceType } from "@/lib/types";

const SERVICES: { key: ServiceType; icon: typeof Fence }[] = [
  { key: "pavers", icon: Fence },
  { key: "turf", icon: Sprout },
  { key: "drainage", icon: Droplets },
  { key: "redesign", icon: Hammer },
  { key: "maintenance", icon: Repeat },
];

export function Services() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SERVICES.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => openBooking({ service: key })}
            className="flex flex-col items-start gap-3 rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-amber-600 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Icon size={20} />
            </span>
            <span className="text-sm font-semibold text-stone-800">
              {t.booking.services[key]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
