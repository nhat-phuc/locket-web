import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") || 100), 500);
  const type = searchParams.get("type");
  const where = type ? { type } : {};
  const transactions = await prisma.transaction.findMany({
    where, orderBy: { createdAt: "desc" }, take,
    include: { user: { select: { username: true, email: true } } },
  });
  return NextResponse.json({ success: true, transactions });
}
