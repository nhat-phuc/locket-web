import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not admin" }, { status: 403 });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "admin",
  });
  await setSessionCookie(token);
  return NextResponse.redirect(new URL("/admin/referral/users", req.url));
}
