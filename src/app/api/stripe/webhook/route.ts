import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// POST /api/stripe/webhook
// Configure this URL in the Stripe Dashboard (or `stripe listen` for local dev).
// Verifies the signature, then reacts to payment lifecycle events.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: "SUCCEEDED" },
      });

      if (intent.metadata?.purpose === "consultation_deposit" && intent.metadata.bookingId) {
        await prisma.booking.update({
          where: { id: intent.metadata.bookingId },
          data: { status: "CONFIRMED" },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: "FAILED" },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      // Recurring maintenance autopay charge succeeded — log it against the client.
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const client = await prisma.client.findUnique({ where: { stripeCustomerId: customerId } });
        if (client) {
          await prisma.payment.create({
            data: {
              clientId: client.id,
              purpose: "MAINTENANCE_AUTOPAY",
              amountCents: invoice.amount_paid,
              status: "SUCCEEDED",
            },
          });
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
