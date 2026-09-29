import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isTeamMember } from "@/lib/teamAuth";
import type { YardPlan } from "@/lib/types";
import { teamLogin, teamLogout } from "./actions";

export default async function TeamPage({ searchParams }: PageProps<"/team">) {
  if (!process.env.TEAM_PASSWORD) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        The team dashboard is turned off. Add <code className="font-mono">TEAM_PASSWORD</code> to the site&apos;s environment settings to enable it.
      </div>
    );
  }

  if (!(await isTeamMember())) {
    const { error } = await searchParams;
    return (
      <form action={teamLogin} className="mx-auto max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">Team sign in</h1>
        <p className="mt-1 text-sm text-stone-600">View the yard designs clients have sent in.</p>
        <label className="mt-5 block text-xs font-semibold text-stone-600">
          Team password
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600" />
        </label>
        {error && <p className="mt-2 text-xs font-medium text-red-600">That password didn&apos;t match.</p>}
        <button type="submit" className="mt-4 w-full rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
          Sign in
        </button>
      </form>
    );
  }

  let bookings: Array<{ id: string; address: string; createdAt: Date; status: string; yardPlanJson: unknown; client: { name: string } }> = [];
  let loadError = false;
  try {
    bookings = await prisma.booking.findMany({
      where: { yardPlanJson: { not: Prisma.AnyNull } },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, address: true, createdAt: true, status: true, yardPlanJson: true, client: { select: { name: true } } },
    });
  } catch (err) {
    console.error("Failed to load team designs", err);
    loadError = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Client yard designs</h1>
          <p className="text-sm text-stone-600">Every design sent in through Build Your Yard, newest first.</p>
        </div>
        <form action={teamLogout}>
          <button type="submit" className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100">Sign out</button>
        </form>
      </div>

      {loadError && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Couldn&apos;t reach the database. Check DATABASE_URL.</p>}
      {!loadError && bookings.length === 0 && <p className="mt-6 text-sm text-stone-500">No designs yet.</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => {
          const plan = booking.yardPlanJson as YardPlan;
          return (
            <Link key={booking.id} href={`/team/${booking.id}`} className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:border-emerald-500 hover:shadow-md">
              <div className="aspect-[16/11] bg-stone-100">
                {plan.explodedRenderDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={plan.explodedRenderDataUrl} alt={`Exploded design for ${booking.address}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">Open to render in 3D</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-stone-900">{booking.client.name}</p>
                <p className="truncate text-xs text-stone-600">{booking.address}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {booking.createdAt.toLocaleDateString("en-US")} · {plan.items.length} pieces · ${Math.round(plan.estimatedTotal).toLocaleString("en-US")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
