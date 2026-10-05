import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// SSE stream — admin connect để nhận event user vào
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  let lastSeen = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      send({ type: "connected", time: new Date().toISOString() });

      const interval = setInterval(async () => {
        try {
          const recentLogs = await prisma.log.findMany({
            where: {
              action: "USER_VISIT",
              createdAt: { gt: lastSeen },
            },
            orderBy: { createdAt: "asc" },
          });

          // Lấy username qua query riêng
          for (const log of recentLogs) {
            let username = "—";
            let email = "—";
            if (log.userId) {
              const u = await prisma.user.findUnique({
                where: { id: log.userId },
                select: { username: true, email: true },
              });
              if (u) {
                username = u.username || "—";
                email = u.email || "—";
              }
            }
            send({
              type: "user-visit",
              username,
              email,
              time: log.createdAt,
            });
          }

          lastSeen = new Date();
        } catch (e) {
          console.error("[live-users]", e);
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
