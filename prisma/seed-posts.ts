import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    title: "Cách nâng cấp Locket Gold chỉ trong 5 giây",
    slug: "cach-nang-cap-locket-gold-trong-5-giay",
    excerpt: "Hướng dẫn chi tiết từng bước để nâng cấp Locket Gold tự động mà không cần cung cấp iCloud hay mật khẩu.",
    content: "<h2>Bước 1: Đăng ký tài khoản</h2><p>Truy cập locketgold.app và đăng ký tài khoản miễn phí.</p><h2>Bước 2: Chọn gói</h2><p>Vào Bảng giá, chọn gói GOLD, VIP, hoặc LUXURY phù hợp.</p><h2>Bước 3: Nhập username Locket</h2><p>Cung cấp username hoặc link Locket của bạn. Chúng tôi không cần mật khẩu.</p><h2>Bước 4: Thanh toán</h2><p>Quét mã QR bằng app ngân hàng. Hệ thống tự động xác nhận trong 1-2 phút.</p><h2>Bước 5: Nhận Profile</h2><p>Cài đặt Profile DNS (iOS) hoặc tải APK (Android) và tận hưởng Gold vĩnh viễn.</p>",
    category: "huong-dan",
    categoryColor: "#a78bfa",
    author: "Phúc Nexus",
    image: "/img/logo/gold.PNG",
    tags: "Locket Gold, Hướng dẫn",
    readTime: "5 phút",
    views: 1250,
    isPublished: true,
    isFeatured: true,
  },
  {
    title: "So sánh các gói VIP: Nên chọn gói nào?",
    slug: "so-sanh-cac-goi-vip-nen-chon-goi-nao",
    excerpt: "Phân tích chi tiết sự khác biệt giữa GOLD, VIP, LUXURY và ADR. Giúp bạn chọn gói phù hợp nhất.",
    content: "<h2>Gói GOLD</h2><p>Phù hợp cho người dùng cá nhân, giá rẻ, có video 3s.</p><h2>Gói VIP</h2><p>Nhiều tính năng hơn, không quảng cáo, hỗ trợ nhiều ID.</p><h2>Gói LUXURY</h2><p>Cao cấp nhất, video 15s, icon & theme độc quyền.</p><h2>Gói ADR</h2><p>Dành riêng cho Android, tải APK và đăng nhập là có Gold.</p>",
    category: "tin-tuc",
    categoryColor: "#60a5fa",
    author: "Phúc Nexus",
    image: "/img/logo/tinhnang.PNG",
    tags: "So sánh, Bảng giá",
    readTime: "7 phút",
    views: 890,
    isPublished: true,
    isFeatured: false,
  },
  {
    title: "10 mẹo sử dụng Locket hiệu quả bạn nên biết",
    slug: "10-meo-su-dung-locket-hieu-qua",
    excerpt: "Tổng hợp những mẹo hay giúp bạn tận dụng tối đa tính năng của Locket Gold.",
    content: "<h2>1. Upload ảnh từ thư viện</h2><p>Tiết kiệm thời gian, không cần chụp mới.</p><h2>2. Quay video 15s</h2><p>Với LUXURY, bạn có thể quay video dài hơn.</p><h2>3. Đổi icon</h2><p>Làm mới màn hình chính với icon Gold.</p><h2>4. Đổi theme</h2><p>Cá nhân hóa giao diện theo sở thích.</p>",
    category: "meo",
    categoryColor: "#fbbf24",
    author: "Admin",
    image: "/img/logo/banbe.PNG",
    tags: "Mẹo, Thủ thuật",
    readTime: "6 phút",
    views: 2100,
    isPublished: true,
    isFeatured: false,
  },
  {
    title: "Cập nhật mới: Video 15s cho gói LUXURY",
    slug: "cap-nhat-video-15s-luxury",
    excerpt: "Gói LUXURY chính thức hỗ trợ quay video Lockets lên đến 15 giây, gấp 5 lần gói VIP thông thường.",
    content: "<h2>Tính năng mới</h2><p>Video 15s cho phép bạn chia sẻ khoảnh khắc dài hơn.</p><h2>Áp dụng cho</h2><p>Chỉ gói LUXURY từ 1-4.</p><h2>Cách dùng</h2><p>Mở Locket, chọn quay video, sẽ thấy tùy chọn 15s.</p>",
    category: "cap-nhat",
    categoryColor: "#34d399",
    author: "Phúc Nexus",
    image: "/img/logo/video.PNG",
    tags: "Cập nhật, LUXURY",
    readTime: "3 phút",
    views: 567,
    isPublished: true,
    isFeatured: false,
  },
  {
    title: "Locket Gold có an toàn cho tài khoản không?",
    slug: "locket-gold-co-an-toan-khong",
    excerpt: "Giải đáp chi tiết về cơ chế bảo mật của hệ thống, cam kết không can thiệp vào tài khoản gốc.",
    content: "<h2>Cam kết an toàn 100%</h2><p>Chúng tôi không can thiệp vào tài khoản gốc của bạn.</p><h2>Cơ chế hoạt động</h2><p>Chỉ dùng username công khai, không cần mật khẩu hay iCloud.</p><h2>Bảo hành 1 đổi 1</h2><p>Nếu mất Gold do bất kỳ lý do, chúng tôi cấp lại miễn phí.</p>",
    category: "tin-tuc",
    categoryColor: "#60a5fa",
    author: "Admin",
    image: "/img/logo/iconungdung.PNG",
    tags: "Bảo mật, An toàn",
    readTime: "4 phút",
    views: 780,
    isPublished: true,
    isFeatured: false,
  },
  {
    title: "Cách đổi icon và theme Locket trên iOS",
    slug: "cach-doi-icon-va-theme-locket-ios",
    excerpt: "Hướng dẫn chi tiết cách thay đổi icon ứng dụng và theme giao diện bên trong Locket Gold.",
    content: "<h2>Đổi icon</h2><p>Vào Cài đặt Locket > Giao diện > Chọn icon.</p><h2>Đổi theme</h2><p>Cùng menu, chọn Theme > Chọn màu yêu thích.</p><h2>Lưu ý</h2><p>Chỉ áp dụng cho iOS với gói VIP/LUXURY.</p>",
    category: "huong-dan",
    categoryColor: "#a78bfa",
    author: "Phúc Nexus",
    image: "/img/logo/giaodien.PNG",
    tags: "Icon, Theme",
    readTime: "5 phút",
    views: 1450,
    isPublished: true,
    isFeatured: false,
  },
];

async function main() {
  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("✅ Đã tạo", posts.length, "bài viết mẫu");
}

main().catch(console.error).finally(() => prisma.$disconnect());
