import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") || 100), 500);
  const logs = await prisma.log.findMany({ orderBy: { createdAt: "desc" }, take });
  return NextResponse.json({ success: true, logs });
}
