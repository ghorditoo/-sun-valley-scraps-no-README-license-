import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const REFERRAL_REWARD_POINTS = 250; // awarded to the referrer once a referred job completes
export const POINTS_TO_DOLLAR_RATIO = 100; // 100 points = $1 of service credit

// POST /api/referrals/redeem
// Applies a client's full points balance as a credit toward their next booking.
// Body: { email: string, bookingId?: string }
export async function POST(req: NextRequest) {
  try {
    const { email, bookingId } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (client.pointsBalance <= 0) {
      return NextResponse.json({ error: "No points balance to redeem" }, { status: 400 });
    }

    const creditDollars = client.pointsBalance / POINTS_TO_DOLLAR_RATIO;

    await prisma.$transaction([
      prisma.client.update({
        where: { id: client.id },
        data: { pointsBalance: 0 },
      }),
      prisma.pointsLedger.create({
        data: {
          clientId: client.id,
          delta: -client.pointsBalance,
          reason: "redeemed_on_booking",
          bookingId: bookingId ?? null,
        },
      }),
    ]);

    return NextResponse.json({ creditDollars, redeemedPoints: client.pointsBalance });
  } catch (err) {
    console.error("Failed to redeem points", err);
    return NextResponse.json({ error: "Unable to redeem points" }, { status: 500 });
  }
}
