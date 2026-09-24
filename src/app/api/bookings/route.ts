import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateStripeCustomer } from "@/lib/stripe";

// POST /api/bookings
// Creates (or reuses) a Client record and a Booking in PENDING_DEPOSIT status.
// The client then confirms via /api/stripe/create-deposit-intent + Stripe Elements.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      service,
      visitType,
      scheduledDate,
      timeSlot,
      address,
      notes,
      photoUrls,
      yardPlan,
      referralCode, // optional: code of the client who referred this new client
    } = body;

    if (!name || !email || !service || !visitType || !scheduledDate || !timeSlot || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await prisma.client.upsert({
      where: { email },
      update: { name, phone },
      create: { name, email, phone },
    });

    // Ensure the client has a Stripe customer for saved-card milestone/autopay billing.
    if (!client.stripeCustomerId) {
      const customer = await getOrCreateStripeCustomer({ email, name });
      await prisma.client.update({
        where: { id: client.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Attribute a referral if this is a brand-new client who used a referral link/code.
    if (referralCode) {
      const referrer = await prisma.client.findUnique({ where: { referralCode } });
      if (referrer && referrer.id !== client.id) {
        await prisma.referral.upsert({
          where: { referredClientId: client.id },
          update: {},
          create: {
            referrerId: referrer.id,
            referredClientId: client.id,
            status: "PENDING",
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        service,
        visitType,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        address,
        notes,
        photoUrls: photoUrls ?? [],
        yardPlanJson: yardPlan ?? undefined,
      },
    });

    return NextResponse.json({ bookingId: booking.id, clientId: client.id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create booking", err);
    return NextResponse.json({ error: "Unable to create booking" }, { status: 500 });
  }
}
