import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Lấy 3 giao dịch nạp tiền
    const recharges = await prisma.transaction.findMany({
      where: { type: 'recharge', status: 'success' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        user: { select: { username: true, name: true, picture: true } },
      },
    });

    // 2. Lấy 3 đơn mua gói
    const orders = await prisma.order.findMany({
      where: { status: { in: ['paid', 'completed'] } },
      orderBy: { paidAt: 'desc' },
      take: 3,
      include: {
        user: { select: { username: true, name: true, picture: true } },
      },
    });

    // 3. Gộp + sắp xếp + lấy 3 mới nhất
    const merged = [
      ...recharges.map((t) => ({
        id: t.id,
        kind: 'recharge' as const,
        serviceName: 'Nạp tiền',
        amount: Math.abs(t.amount),
        finalAmount: Math.abs(t.amount),
        paidAt: t.createdAt.toISOString(),
        user: t.user,
      })),
      ...orders.map((o) => ({
        id: o.id,
        kind: 'order' as const,
        serviceName: o.serviceName,
        amount: o.amount,
        finalAmount: o.finalAmount,
        paidAt: (o.paidAt || o.createdAt).toISOString(),
        user: o.user,
      })),
    ]
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .slice(0, 3);

    return NextResponse.json({ orders: merged });
  } catch (error) {
    console.error('[recent-purchases]', error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
