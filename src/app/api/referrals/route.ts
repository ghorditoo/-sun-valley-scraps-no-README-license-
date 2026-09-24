import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/referrals?email=client@example.com
// Returns the referral card data: code, points balance, and jobs referred count.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { email },
    include: {
      referralsSent: { where: { status: "REWARDED" } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({
    referralCode: client.referralCode,
    referralLink: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/?ref=${client.referralCode}`,
    pointsBalance: client.pointsBalance,
    jobsReferred: client.referralsSent.length,
  });
}
