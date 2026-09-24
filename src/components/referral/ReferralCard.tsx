"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Gift, Users, Wallet } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";

type ReferralData = {
  referralCode: string;
  referralLink: string;
  pointsBalance: number;
  jobsReferred: number;
};

// Demo client used until a real auth/session system identifies the logged-in client.
const DEMO_CLIENT_EMAIL = "demo.client@example.com";

export function ReferralCard() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const [data, setData] = useState<ReferralData>({
    referralCode: "DEMO2024",
    referralLink: "https://example.com/?ref=DEMO2024",
    pointsBalance: 750,
    jobsReferred: 3,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/referrals?email=${encodeURIComponent(DEMO_CLIENT_EMAIL)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && !json.error) setData(json);
      })
      .catch(() => {
        // Falls back silently to the demo data above (e.g. DB not configured yet).
      });
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleApplyBalance() {
    try {
      const res = await fetch("/api/referrals/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: DEMO_CLIENT_EMAIL }),
      });
      if (res.ok) {
        setData((prev) => ({ ...prev, pointsBalance: 0 }));
      }
    } finally {
      openBooking();
    }
  }

  return (
    <section id="referrals" className="bg-stone-900 py-16 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.referral.heading}</h2>
          <p className="mt-3 text-stone-300">{t.referral.subheading}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-200">{t.brand.name}</span>
              <Gift size={22} className="text-brand-200" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-brand-200">
                  <Wallet size={13} /> {t.referral.pointsBalance}
                </p>
                <p className="mt-1 text-3xl font-bold">{data.pointsBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-brand-200">
                  <Users size={13} /> {t.referral.jobsReferred}
                </p>
                <p className="mt-1 text-3xl font-bold">{data.jobsReferred}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-brand-200">{t.referral.yourCode}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="truncate text-sm font-semibold">{data.referralLink}</code>
                <button
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t.referral.copied : t.referral.copyLink}
                </button>
              </div>
            </div>

            <button
              onClick={handleApplyBalance}
              disabled={data.pointsBalance <= 0}
              className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.referral.applyBalance}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{t.referral.howItWorks}</h3>
            <ol className="mt-4 space-y-4">
              {t.referral.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-300">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

