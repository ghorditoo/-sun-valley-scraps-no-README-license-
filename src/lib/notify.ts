import { materials } from "@/data/materials";
import type { YardPlan } from "@/lib/types";

// Emails the team when a client submits a "Build Your Yard" design.
// Uses Resend's HTTP API; silently skipped unless RESEND_API_KEY and TEAM_NOTIFY_EMAIL are set.

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export function summarizeMaterials(plan: YardPlan) {
  const counts = new Map<string, number>();
  for (const item of plan.items) counts.set(item.materialId, (counts.get(item.materialId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ name: materials.find((entry) => entry.id === id)?.name ?? id, count }))
    .sort((left, right) => right.count - left.count);
}

export async function sendDesignNotification({
  bookingId,
  clientName,
  clientEmail,
  clientPhone,
  address,
  plan,
}: {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  address: string;
  plan: YardPlan;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const teamLink = `${siteUrl}/team/${bookingId}`;
  const materialRows = summarizeMaterials(plan)
    .map(({ name, count }) => `<li>${escapeHtml(name)} × ${count}</li>`)
    .join("");
  const render = plan.explodedRenderDataUrl?.match(/^data:image\/(jpeg|png);base64,(.+)$/);

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#1c1917">
      <h2 style="color:#065f46">New yard design from ${escapeHtml(clientName)}</h2>
      <p><strong>Address:</strong> ${escapeHtml(address)}<br/>
      <strong>Email:</strong> ${escapeHtml(clientEmail)}${clientPhone ? `<br/><strong>Phone:</strong> ${escapeHtml(clientPhone)}` : ""}<br/>
      <strong>Estimate:</strong> $${Math.round(plan.estimatedTotal).toLocaleString("en-US")} · ${plan.items.length} pieces</p>
      ${render ? `<p>The exploded-view render is attached.</p>` : ""}
      <p><a href="${teamLink}" style="background:#065f46;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open interactive 3D view</a></p>
      <h3>Materials</h3><ul>${materialRows || "<li>No pieces placed</li>"}</ul>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL ?? "Sun Valley Scraps <onboarding@resend.dev>",
      to: to.split(",").map((entry) => entry.trim()),
      subject: `New yard design: ${clientName} – ${address}`,
      html,
      attachments: render ? [{ filename: `exploded-view-${bookingId}.${render[1] === "png" ? "png" : "jpg"}`, content: render[2] }] : undefined,
    }),
  });
  if (!response.ok) console.error("Design notification email failed", response.status, await response.text());
}
