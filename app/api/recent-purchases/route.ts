import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['paid', 'completed'] },
    },
    orderBy: { paidAt: 'desc' },
    take: 20,
  });

  const userIds = [...new Set(orders.map((o) => o.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, username: true, picture: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const data = orders.map((o) => ({ ...o, user: userMap[o.userId] || null }));
  return NextResponse.json({ orders: data });
}
