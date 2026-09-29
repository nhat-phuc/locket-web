import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const user = await p.user.findFirst({ where: { email: 'trannhatphuc1234xx@gmail.com' } });
  const service = await p.service.findFirst({ where: { type: 'luxury' } });

  if (!user || !service) {
    console.log('Khong co user/service');
    return;
  }

  const amount = 149000;
  const discount = 14900;
  const finalAmount = amount - discount;

  const order = await p.order.create({
    data: {
      orderCode: 'LKT-LUX-TEST' + Date.now().toString().slice(-4),
      userId: user.id,
      serviceId: service.id,
      serviceName: 'Goi LUXURY 15S (iOS)',
      amount: amount,
      discount: discount,
      finalAmount: finalAmount,
      couponCode: 'GIAM10',
      status: 'paid',
      paymentMethod: 'bank_transfer',
      locketUsername: 'xiaoth',
      paidAt: new Date(),
    }
  });

  console.log('Da tao:', order.orderCode);
  console.log('Final:', finalAmount.toLocaleString('vi-VN'));

  p.$disconnect();
}

main().catch(function(e) { console.error(e); p.$disconnect(); });
