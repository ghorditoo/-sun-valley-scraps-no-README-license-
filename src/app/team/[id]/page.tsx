import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExplodedYardView } from "@/components/yard-visualizer/ExplodedYardView";
import { prisma } from "@/lib/db";
import { summarizeMaterials } from "@/lib/notify";
import { isTeamMember } from "@/lib/teamAuth";
import type { YardPlan } from "@/lib/types";

export default async function TeamDesignPage({ params }: PageProps<"/team/[id]">) {
  if (!(await isTeamMember())) redirect("/team");
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id }, include: { client: true } });
  if (!booking?.yardPlanJson) notFound();
  const plan = booking.yardPlanJson as unknown as YardPlan;
  const materialList = summarizeMaterials(plan);
  const measurements = plan.measurements;

  return (
    <div>
      <Link href="/team" className="text-xs font-semibold text-emerald-800 hover:underline">← All designs</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{booking.client.name}</h1>
          <p className="text-sm text-stone-600">{booking.address}</p>
        </div>
        <p className="text-2xl font-bold text-emerald-800">${Math.round(plan.estimatedTotal).toLocaleString("en-US")}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ExplodedYardView key={booking.id} plan={plan} fileName={`exploded-${booking.client.name.replace(/\W+/g, "-").toLowerCase()}-${booking.id.slice(-6)}`} />

        <aside className="space-y-4 text-sm">
          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-xs font-bold uppercase text-stone-500">Client</h2>
            <p className="mt-2 text-stone-900">{booking.client.email}</p>
            {booking.client.phone && <p className="text-stone-900">{booking.client.phone}</p>}
            <p className="mt-2 text-xs text-stone-500">
              {booking.service.toLowerCase()} · {booking.visitType.toLowerCase()} visit · {booking.scheduledDate.toLocaleDateString("en-US", { timeZone: "UTC" })} {booking.timeSlot}
            </p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-emerald-800 hover:underline">
              Open address in Maps
            </a>
            {booking.notes && <p className="mt-3 whitespace-pre-wrap rounded bg-stone-50 p-2 text-xs text-stone-700">{booking.notes}</p>}
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-xs font-bold uppercase text-stone-500">Materials ({plan.items.length} pieces)</h2>
            <ul className="mt-2 space-y-1">
              {materialList.map(({ name, count }) => (
                <li key={name} className="flex justify-between gap-2"><span className="text-stone-800">{name}</span><span className="font-mono text-stone-500">×{count}</span></li>
              ))}
              {materialList.length === 0 && <li className="text-stone-500">No pieces placed</li>}
            </ul>
          </section>

          {measurements && (
            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="text-xs font-bold uppercase text-stone-500">Measurements</h2>
              <p className="mt-2 text-stone-800">Yard {measurements.yardWidthFt} × {measurements.yardLengthFt} ft</p>
              <p className="text-stone-800">House {measurements.houseWidthFt} × {measurements.houseDepthFt} ft</p>
              <p className="text-stone-800">Area {plan.areaSqFt} sq ft</p>
            </section>
          )}

          {(plan.photoDataUrl || booking.photoUrls.length > 0) && (
            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="text-xs font-bold uppercase text-stone-500">Client photos</h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[plan.photoDataUrl, ...booking.photoUrls].filter(Boolean).map((src, index) => (
                  <a key={index} href={src!} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src!} alt={`Client photo ${index + 1}`} className="aspect-square w-full rounded object-cover" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
