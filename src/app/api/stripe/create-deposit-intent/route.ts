import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDepositPaymentIntent } from "@/lib/stripe";

// POST /api/stripe/create-deposit-intent
// Called right before rendering Stripe Elements in the final booking step.
// Returns a client secret the frontend uses with @stripe/react-stripe-js's
// <PaymentElement /> to collect and save the card, and confirm the deposit.
export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true },
    });

    if (!booking || !booking.client.stripeCustomerId) {
      return NextResponse.json({ error: "Booking or Stripe customer not found" }, { status: 404 });
    }

    const intent = await createDepositPaymentIntent({
      customerId: booking.client.stripeCustomerId,
      bookingId: booking.id,
    });

    await prisma.payment.create({
      data: {
        clientId: booking.clientId,
        bookingId: booking.id,
        stripePaymentIntentId: intent.id,
        purpose: "CONSULTATION_DEPOSIT",
        amountCents: intent.amount,
        status: "REQUIRES_ACTION",
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Failed to create deposit intent", err);
    return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
  }
}
