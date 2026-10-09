import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false }, { status: auth.status });

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Tạo CSV
    const headers = ["ID", "Username", "Email", "Tên", "SĐT", "Số dư", "Thưởng", "Role", "Bị khóa", "Ngày tạo"];
    const rows = users.map((u) => [
      u.id,
      u.username,
      u.email,
      u.name || "",
      u.phone || "",
      u.balance.toString(),
      u.bonusBalance.toString(),
      u.role,
      u.isBanned ? "Có" : "Không",
      u.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

    return new NextResponse("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("[export-users]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
