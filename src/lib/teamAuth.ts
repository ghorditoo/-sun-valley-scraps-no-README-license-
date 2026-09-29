import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Simple shared-password access for the team dashboard (/team).
// Set TEAM_PASSWORD in the environment; the cookie stores an HMAC, never the password.

export const TEAM_COOKIE = "svs_team";

function safeEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function teamToken() {
  const password = process.env.TEAM_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("sun-valley-team-v1").digest("hex");
}

export function teamPasswordMatches(input: string) {
  const password = process.env.TEAM_PASSWORD;
  return Boolean(password) && safeEqual(input, password!);
}

export async function isTeamMember() {
  const token = teamToken();
  if (!token) return false;
  const value = (await cookies()).get(TEAM_COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, token);
}
