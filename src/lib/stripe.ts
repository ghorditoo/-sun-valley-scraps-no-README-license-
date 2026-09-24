import Stripe from "stripe";

// Server-only Stripe client. STRIPE_SECRET_KEY must be set in your environment (.env.local).
// Never import this file from a "use client" component.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
});

export const CONSULTATION_DEPOSIT_CENTS = 4900; // $49.00 refundable deposit

/**
 * Creates (or reuses) a Stripe Customer for a client so we can store a payment
 * method on file for milestone payments and recurring maintenance autopay.
 */
export async function getOrCreateStripeCustomer(params: {
  email: string;
  name: string;
  existingCustomerId?: string | null;
}) {
  if (params.existingCustomerId) {
    return stripe.customers.retrieve(params.existingCustomerId);
  }
  return stripe.customers.create({
    email: params.email,
    name: params.name,
  });
}

/**
 * Step 1 of the payment architecture: a one-time PaymentIntent for the
 * refundable consultation deposit. `setup_future_usage` saves the card so it
 * can be reused for milestone payments without asking the client to re-enter it.
 */
export async function createDepositPaymentIntent(params: {
  customerId: string;
  bookingId: string;
}) {
  return stripe.paymentIntents.create({
    amount: CONSULTATION_DEPOSIT_CENTS,
    currency: "usd",
    customer: params.customerId,
    setup_future_usage: "off_session",
    metadata: { bookingId: params.bookingId, purpose: "consultation_deposit" },
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Step 2: charge a saved card off-session for a project milestone
 * (e.g. 50% on start, 50% on completion) once the client has approved a quote.
 */
export async function chargeMilestone(params: {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  bookingId: string;
  milestoneLabel: string;
}) {
  return stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: "usd",
    customer: params.customerId,
    payment_method: params.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      bookingId: params.bookingId,
      purpose: "milestone_payment",
      milestone: params.milestoneLabel,
    },
  });
}

/**
 * Step 3: recurring maintenance autopay. Creates a Stripe Subscription against
 * a Price (configured in the Stripe Dashboard or via stripe.prices.create)
 * so the client is billed automatically every cycle (e.g. monthly mowing).
 */
export async function createMaintenanceSubscription(params: {
  customerId: string;
  priceId: string;
  defaultPaymentMethodId: string;
}) {
  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    default_payment_method: params.defaultPaymentMethodId,
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.confirmation_secret"],
  });
}
