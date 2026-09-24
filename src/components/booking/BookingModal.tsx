"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Fence,
  Sprout,
  Droplets,
  Hammer,
  Repeat,
  MapPin,
  Video,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "./BookingContext";
import { DepositPaymentStep } from "./DepositPaymentStep";
import type { ServiceType, VisitType } from "@/lib/types";

const SERVICE_ICONS: Record<ServiceType, typeof Fence> = {
  pavers: Fence,
  turf: Sprout,
  drainage: Droplets,
  redesign: Hammer,
  maintenance: Repeat,
};

const STEP_KEYS = ["service", "schedule", "details", "payment"] as const;

export function BookingModal() {
  const { t } = useLanguage();
  const { isOpen, prefill, closeBooking } = useBooking();

  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceType | undefined>(prefill.service);
  const [visitType, setVisitType] = useState<VisitType>("site");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setService(prefill.service);
      setSuccess(false);
      setError(null);
      setBookingId(null);
      setClientSecret(null);
    }
  }, [isOpen, prefill.service]);

  if (!isOpen) return null;

  async function handleCreateBookingAndDeposit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          service,
          visitType,
          scheduledDate: date,
          timeSlot: time,
          address,
          notes,
          yardPlan: prefill.yardPlan ?? null,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");
      const { bookingId: newBookingId } = await res.json();
      setBookingId(newBookingId);

      const depositRes = await fetch("/api/stripe/create-deposit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: newBookingId }),
      });

      if (!depositRes.ok) throw new Error("Could not start deposit payment");
      const { clientSecret: secret } = await depositRes.json();
      setClientSecret(secret);
      setStep(3);
    } catch {
      setError(
        "We couldn't reach the booking service. This demo requires STRIPE_SECRET_KEY and DATABASE_URL to be configured."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueFromService = Boolean(service);
  const canContinueFromSchedule = Boolean(date && time);
  const canContinueFromDetails = Boolean(name && email && phone && address);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
        onClick={closeBooking}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{t.booking.heading}</h2>
              <p className="text-xs text-stone-500">{t.booking.subheading}</p>
            </div>
            <button onClick={closeBooking} aria-label="Close" className="text-stone-400 hover:text-stone-700">
              <X size={20} />
            </button>
          </div>

          {!success && (
            <div className="flex items-center gap-2 px-6 pt-4">
              {STEP_KEYS.map((key, i) => (
                <div key={key} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i <= step ? "bg-brand-700 text-white" : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="hidden truncate text-xs font-medium text-stone-600 sm:block">
                    {t.booking.steps[key]}
                  </span>
                  {i < STEP_KEYS.length - 1 && <div className="h-px flex-1 bg-stone-200" />}
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            {success ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 size={48} className="text-brand-600" />
                <h3 className="text-xl font-bold text-stone-900">{t.booking.successTitle}</h3>
                <p className="text-stone-600">{t.booking.successBody}</p>
                <button
                  onClick={closeBooking}
                  className="mt-4 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(Object.keys(SERVICE_ICONS) as ServiceType[]).map((key) => {
                      const Icon = SERVICE_ICONS[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setService(key)}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                            service === key
                              ? "border-brand-600 bg-brand-50"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <Icon size={20} className="text-brand-700" />
                          <span className="text-sm font-semibold text-stone-800">
                            {t.booking.services[key]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => setVisitType("site")}
                        className={`flex items-center gap-2 rounded-xl border-2 p-4 text-left transition ${
                          visitType === "site"
                            ? "border-brand-600 bg-brand-50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <MapPin size={18} className="text-brand-700" />
                        <span className="text-sm font-semibold">{t.booking.visitType.site}</span>
                      </button>
                      <button
                        onClick={() => setVisitType("virtual")}
                        className={`flex items-center gap-2 rounded-xl border-2 p-4 text-left transition ${
                          visitType === "virtual"
                            ? "border-brand-600 bg-brand-50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <Video size={18} className="text-brand-700" />
                        <span className="text-sm font-semibold">{t.booking.visitType.virtual}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.dateLabel}</span>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.timeLabel}</span>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.nameLabel}</span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.emailLabel}</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.phoneLabel}</span>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium text-stone-700">{t.booking.addressLabel}</span>
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                        />
                      </label>
                    </div>

                    <label className="block text-sm">
                      <span className="font-medium text-stone-700">{t.booking.photoLabel}</span>
                      <div className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-2">
                        <ImagePlus size={16} className="text-stone-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPhotoFileName(e.target.files?.[0]?.name ?? null)}
                          className="text-xs"
                        />
                      </div>
                      {photoFileName && (
                        <span className="mt-1 block text-xs text-stone-500">{photoFileName}</span>
                      )}
                    </label>

                    <label className="block text-sm">
                      <span className="font-medium text-stone-700">{t.booking.notesLabel}</span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
                      />
                    </label>

                    {prefill.yardPlan && (
                      <div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
                        Attached "Build Your Yard" plan: ${prefill.yardPlan.estimatedTotal.toFixed(0)}{" "}
                        estimated · {prefill.yardPlan.items.length} materials
                      </div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    {clientSecret ? (
                      <DepositPaymentStep clientSecret={clientSecret} onSuccess={() => setSuccess(true)} />
                    ) : (
                      <p className="text-sm text-stone-500">Preparing secure payment…</p>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-600 disabled:opacity-0"
                  >
                    {t.booking.back}
                  </button>

                  {step < 2 && (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      disabled={step === 0 ? !canContinueFromService : !canContinueFromSchedule}
                      className="rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {t.booking.next}
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      onClick={handleCreateBookingAndDeposit}
                      disabled={!canContinueFromDetails || submitting}
                      className="rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {submitting ? "…" : t.booking.next}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

