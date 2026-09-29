"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEAM_COOKIE, teamPasswordMatches, teamToken } from "@/lib/teamAuth";

export async function teamLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const token = teamToken();
  if (!token || !teamPasswordMatches(password)) redirect("/team?error=1");
  (await cookies()).set(TEAM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/team",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/team");
}

export async function teamLogout() {
  (await cookies()).delete({ name: TEAM_COOKIE, path: "/team" });
  redirect("/team");
}
