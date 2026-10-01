import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const user = await p.user.findFirst();
  if (!user) {
    console.log('❌ Không có user');
    process.exit(1);
  }
  console.log('✅ Dùng user:', user.username);

  // Xóa review cũ (nếu chạy lại)
  await p.review.deleteMany({
    where: {
      name: { in: ['Mi***nh', 'Ho***ng', 'Th***Ha', 'Qu***ao', 'La***ng'] },
    },
  });

  const reviews = [
    { name: 'Mi***nh', text: 'Dịch vụ rất tốt, mua VIP 1 tháng dùng mượt mà. Sẽ ủng hộ tiếp!', rating: 5 },
    { name: 'Ho***ng', text: 'Giao dịch nhanh, hỗ trợ nhiệt tình. Recommend cho mọi người.', rating: 5 },
    { name: 'Th***Ha', text: 'Giá cả hợp lý, chất lượng ổn định. Rất hài lòng với dịch vụ.', rating: 5 },
    { name: 'Qu***ao', text: 'Đã mua gói LUXURY, dùng rất ok. Cảm ơn shop nhiều!', rating: 5 },
    { name: 'La***ng', text: 'Thanh toán tiện, tự động kích hoạt sau 1 phút. 5 sao!', rating: 5 },
  ];

  for (const r of reviews) {
    try {
      await p.review.create({
        data: {
          userId: user.id,
          name: r.name,
          initial: r.name.charAt(0).toUpperCase(),
          text: r.text,
          rating: r.rating,
          status: 'approved',
          isApproved: true,
          isFeatured: true,
          time: 'Vừa xong',
        },
      });
      console.log('✅ Tạo review:', r.name);
    } catch (e: any) {
      console.log('❌ Lỗi', r.name, ':', e.message);
    }
  }

  const count = await p.review.count();
  console.log('');
  console.log('📊 Tổng Review trong DB:', count);
  process.exit(0);
}

main();
