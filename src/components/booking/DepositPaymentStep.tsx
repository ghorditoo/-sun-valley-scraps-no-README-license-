"use client";

import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { getStripe } from "@/lib/stripeClient";
import { useLanguage } from "@/i18n/LanguageProvider";

function DepositForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    // confirmPayment also saves the card on the Customer because the intent
    // was created with `setup_future_usage: "off_session"` (see lib/stripe.ts),
    // enabling later milestone charges and maintenance autopay without re-entry.
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setSubmitting(false);
    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        <ShieldCheck size={16} />
        {t.booking.depositNotice}
      </div>
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-700 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {t.booking.payDeposit}
      </button>
    </form>
  );
}

export function DepositPaymentStep({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <DepositForm onSuccess={onSuccess} />
    </Elements>
  );
}
