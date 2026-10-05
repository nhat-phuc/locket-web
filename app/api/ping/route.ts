import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notifyAdminUserVisit } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, email: true, name: true, lastActiveAt: true },
    });
    if (!user) return NextResponse.json({ success: false });

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;
    const diffMinutes = (now.getTime() - lastActive) / 60000;

    // Nếu > 30 phút không active → coi như "vừa vào mới"
    const isNewSession = diffMinutes > 30;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now },
    });

    // Nếu là session mới → gửi Telegram + lưu log
    if (isNewSession) {
      await prisma.log.create({
        data: {
          action: "USER_VISIT",
          userId: user.id,
          detail: `User @${user.username} vừa truy cập`,
        },
      });

      // Gửi Telegram (không await để không block)
      notifyAdminUserVisit({
        username: user.username,
        email: user.email,
        name: user.name,
        time: now,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, isNewSession });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
