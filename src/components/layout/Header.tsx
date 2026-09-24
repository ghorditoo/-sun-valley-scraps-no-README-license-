"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";

export function Header() {
  const { t, locale, setLocale } = useLanguage();
  const { openBooking } = useBooking();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#services", label: t.nav.services },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#visualizer", label: t.nav.visualizer },
    { href: "#referrals", label: t.nav.referrals },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image src="/logos/logo-mark.svg" alt={t.brand.name} fill className="object-cover" />
          </span>
          <span className="hidden text-lg leading-tight sm:block">{t.brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition hover:text-emerald-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "en" ? "es" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-emerald-600 hover:text-emerald-700"
            aria-label="Toggle language"
          >
            <Globe size={15} />
            <span>{locale === "en" ? "ES" : "EN"}</span>
          </button>

          <button
            onClick={() => openBooking()}
            className="hidden rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:block"
          >
            {t.nav.bookNow}
          </button>

          <button
            className="lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-200 bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openBooking();
                }}
                className="mt-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
              >
                {t.nav.bookNow}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
