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
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Ping ban đầu
      send({ type: "connected", time: new Date().toISOString() });

      // Poll DB mỗi 5s để tìm user mới active
      const interval = setInterval(async () => {
        try {
          const recentLogs = await prisma.log.findMany({
            where: {
              action: "USER_VISIT",
              createdAt: { gt: lastSeen },
            },
            orderBy: { createdAt: "asc" },
            include: { user: { select: { username: true, email: true } } },
          });

          for (const log of recentLogs) {
            send({
              type: "user-visit",
              username: log.user?.username || "—",
              email: log.user?.email || "—",
              time: log.createdAt,
            });
          }

          lastSeen = new Date();
        } catch {}
      }, 5000);

      // Cleanup khi client ngắt
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
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
