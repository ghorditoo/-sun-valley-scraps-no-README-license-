import { NextRequest, NextResponse, after } from "next/server";
import { ServiceType, VisitType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendDesignNotification } from "@/lib/notify";
import { getOrCreateStripeCustomer } from "@/lib/stripe";
import type { YardPlan } from "@/lib/types";

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

    // The form sends lowercase values; the database enums are uppercase.
    const serviceType = String(service).toUpperCase() as ServiceType;
    const visit = String(visitType).toUpperCase() as VisitType;
    if (!Object.values(ServiceType).includes(serviceType) || !Object.values(VisitType).includes(visit)) {
      return NextResponse.json({ error: "Invalid service or visit type" }, { status: 400 });
    }

    // Only keep a render that is a real inline image of reasonable size.
    const plan = yardPlan as YardPlan | null | undefined;
    if (plan?.explodedRenderDataUrl && (!/^data:image\/(jpeg|png);base64,/.test(plan.explodedRenderDataUrl) || plan.explodedRenderDataUrl.length > 4_000_000)) {
      delete plan.explodedRenderDataUrl;
    }

    const client = await prisma.client.upsert({
      where: { email },
      update: { name, phone },
      create: { name, email, phone },
    });

    // Ensure the client has a Stripe customer for saved-card milestone/autopay billing.
    // A Stripe outage shouldn't lose the booking or the client's design.
    if (!client.stripeCustomerId) {
      try {
        const customer = await getOrCreateStripeCustomer({ email, name });
        await prisma.client.update({
          where: { id: client.id },
          data: { stripeCustomerId: customer.id },
        });
      } catch (stripeErr) {
        console.error("Stripe customer creation failed; saving booking anyway", stripeErr);
      }
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
        service: serviceType,
        visitType: visit,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        address,
        notes,
        photoUrls: photoUrls ?? [],
        yardPlanJson: plan ?? undefined,
      },
    });

    if (plan) {
      after(() =>
        sendDesignNotification({
          bookingId: booking.id,
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          address,
          plan,
        }).catch((notifyErr) => console.error("Design notification failed", notifyErr)),
      );
    }

    return NextResponse.json({ bookingId: booking.id, clientId: client.id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create booking", err);
    return NextResponse.json({ error: "Unable to create booking" }, { status: 500 });
  }
}
