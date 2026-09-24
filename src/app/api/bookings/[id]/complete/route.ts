import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REFERRAL_REWARD_POINTS } from "@/app/api/referrals/redeem/route";

// POST /api/bookings/[id]/complete
// Called by an admin/ops action (or a job-completion workflow) once the crew
// finishes a project. Marks the booking COMPLETED and, if this client was
// referred, awards the referrer their loyalty points automatically.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
      include: { client: true },
    });

    const referral = await prisma.referral.findUnique({
      where: { referredClientId: booking.clientId },
    });

    if (referral && referral.status === "PENDING") {
      await prisma.$transaction([
        prisma.referral.update({
          where: { id: referral.id },
          data: {
            status: "REWARDED",
            pointsAwarded: REFERRAL_REWARD_POINTS,
            completedBookingId: booking.id,
            rewardedAt: new Date(),
          },
        }),
        prisma.client.update({
          where: { id: referral.referrerId },
          data: { pointsBalance: { increment: REFERRAL_REWARD_POINTS } },
        }),
        prisma.pointsLedger.create({
          data: {
            clientId: referral.referrerId,
            delta: REFERRAL_REWARD_POINTS,
            reason: "referral_reward",
            bookingId: booking.id,
          },
        }),
      ]);
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Failed to complete booking", err);
    return NextResponse.json({ error: "Unable to complete booking" }, { status: 500 });
  }
}
