export interface Deposit {
  name: string;
  plan: string;
  type: "adr" | "gold" | "vip" | "luxury" | "agent";
  amount: number;
  time: string;
  discount: string | null;
}

export interface Review {
  name: string;
  initial: string;
  text: string;
  time: string;
  img: string;
}

export interface SaleItem {
  name: string;
  plan: string;
  time: string;
}

export const depositData: Deposit[] = [
  { name: "ngm***08", plan: "ADR 1 - ANDROID", type: "adr", amount: 79000, time: "12 phút trước", discount: null },
  { name: "myt***yd", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "1 giờ trước", discount: null },
  { name: "Yen***05", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "1 giờ trước", discount: null },
  { name: "TRA***NG", plan: "ĐẠI LÝ 3", type: "agent", amount: 999000, time: "2 giờ trước", discount: null },
  { name: "nha***00", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "3 giờ trước", discount: "10%" },
  { name: "Duk***ee", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "3 giờ trước", discount: null },
  { name: "Tra***oc", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "6 giờ trước", discount: null },
  { name: "lt2***10", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "6 giờ trước", discount: null },
  { name: "hie***91", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "8 giờ trước", discount: "20%" },
  { name: "doa***77", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "13 giờ trước", discount: null },
  { name: "xiao***", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "14 giờ trước", discount: "10%" },
  { name: "trh***78", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "17 giờ trước", discount: null },
  { name: "Sun***Hi", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "21 giờ trước", discount: null },
  { name: "Han***uy", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "23 giờ trước", discount: null },
  { name: "Hab***ng", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: "20%" },
  { name: "dun***o7", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "1 ngày trước", discount: null },
  { name: "bao***20", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "Duo***on", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "kho***09", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "hoa***03", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "1 ngày trước", discount: null },
  { name: "cam***07", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "van***p7", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "ngv***an", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "1 ngày trước", discount: null },
  { name: "ann***18", plan: "ADR 1 - ANDROID", type: "adr", amount: 79000, time: "1 ngày trước", discount: null },
  { name: "Tra***06", plan: "Gói GOLD 1T (15s)", type: "gold", amount: 129000, time: "1 ngày trước", discount: null },
  { name: "tie***12", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "1 ngày trước", discount: null },
  { name: "Kie***h1", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "1 ngày trước", discount: null },
  { name: "Pha***nn", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "1 ngày trước", discount: null },
  { name: "nng***09", plan: "ADR 1 - ANDROID", type: "adr", amount: 79000, time: "1 ngày trước", discount: null },
  { name: "ber***33", plan: "LUXURY 1", type: "luxury", amount: 129000, time: "1 ngày trước", discount: null },
  { name: "phu***88", plan: "Gói VIP 2", type: "vip", amount: 148000, time: "2 ngày trước", discount: null },
  { name: "min***g0", plan: "LUXURY 2", type: "luxury", amount: 229000, time: "2 ngày trước", discount: "15%" },
  { name: "huy***zz", plan: "Gói GOLD 1T (15s)", type: "gold", amount: 129000, time: "2 ngày trước", discount: null },
  { name: "kha***30", plan: "ADR 1 - ANDROID", type: "adr", amount: 79000, time: "2 ngày trước", discount: null },
  { name: "ngu***11", plan: "Gói VIP 1", type: "vip", amount: 99000, time: "3 ngày trước", discount: null },
  { name: "le***88", plan: "LUXURY 3", type: "luxury", amount: 329000, time: "3 ngày trước", discount: null },
  { name: "hd***15", plan: "Gói GOLD 1T (3s)", type: "gold", amount: 79000, time: "3 ngày trước", discount: null },
  { name: "kh***07", plan: "ADR 1 - ANDROID", type: "adr", amount: 79000, time: "3 ngày trước", discount: "10%" },
];

// lib/data.ts
export const reviews: Review[] = [
  { name: "ho***wj", initial: "H", text: "Uy tín", time: "21 giờ trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-alexanderpham1001-1789269618.webp" },
  { name: "qp***30", initial: "Q", text: "Uy tín", time: "1 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-cuongloveconan-1789310648.webp" },
  { name: "kl***nh", initial: "K", text: "Uy tín", time: "3 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-gdinh2401-1789016313.webp" },
  { name: "ng***k0", initial: "N", text: "Uy tín", time: "3 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-haomilknoob-1789737511.webp" },
  { name: "hi***ii", initial: "H", text: "uy tín lắm ah", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-huynguyen39348-1789302143.webp" },
  { name: "Ph***ng", initial: "P", text: "Uy tín", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-mhxinhgai-1788868821.webp" },
  { name: "th***77", initial: "T", text: "Oke nha", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nguyenhoanghiep21062008-1789208040.webp" },
  { name: "va***it", initial: "V", text: "Uy tín nha", time: "5 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nhuanh0304-1788837719.webp" },
  { name: "Ng***89", initial: "N", text: "uytin", time: "5 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nmy362685-1788929202.webp" },
  { name: "em***89", initial: "E", text: "uy tín", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nt19042099-1789906616.webp" },
  { name: "Ry***an", initial: "R", text: "Locket 15s an toàn", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-quangnhat-1788742227.webp" },
  { name: "ki***09", initial: "K", text: "uy tin", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-thitranle38-1788670297.webp" },
  { name: "tu***gt", initial: "T", text: "Uy tín", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-tungkk000-1790093269.webp" },
  { name: "ng***nh", initial: "N", text: "Uy tín", time: "7 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-trinhkhoa310-1789266941.webp" },
  { name: "ng***om", initial: "N", text: "Locket của mình bị lỗi nhma vẫn đc sửa ❤️", time: "7 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-thitranle38-1788670297.webp" },
  { name: "vu***nn", initial: "V", text: "uy tín", time: "8 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-alexanderpham1001-1789269618.webp" },
];
export const realSales: SaleItem[] = [
  { name: "ngm***08", plan: "ADR 1 - ANDROID (1 lần tải)", time: "12 phút trước" },
  { name: "myt***yd", plan: "Gói GOLD 1T (3s)", time: "1 giờ trước" },
  { name: "Yen***05", plan: "Gói GOLD 1T (3s)", time: "1 giờ trước" },
  { name: "TRA***NG", plan: "ĐẠI LÝ 3 (Không giới hạn)", time: "2 giờ trước" },
  { name: "nha***00", plan: "LUXURY 1 Cá nhân", time: "3 giờ trước" },
];

export const faqItems = [
  { q: "Dịch vụ hỗ trợ trên nền tảng nào?", a: "Hệ thống hỗ trợ cả iOS (iPhone & iPad) và Android. iOS: kích hoạt qua Username + DNS. Android: tải APK Locket Gold." },
  { q: "Điều gì xảy ra khi tôi thay đổi thiết bị?", a: "iOS: cài lại cấu hình DNS. Android: tải lại APK. Hoàn toàn miễn phí và không giới hạn số lần." },
  { q: "Tôi có cần chia sẻ mật khẩu cá nhân không?", a: "Hoàn toàn không. Chỉ cần Username/Link Locket công khai." },
  { q: "Việc nâng cấp có an toàn cho tài khoản không?", a: "Hệ thống hoạt động độc lập, không can thiệp tài khoản gốc. An toàn 100%." },
  { q: "Quá trình kích hoạt mất bao lâu?", a: "Sau khi thanh toán, hệ thống tự động đối soát trong vòng chưa tới 1 phút." },
];

export const badgeColors: Record<string, string> = {
  gold: "rgba(251,191,36,0.12)",
  vip: "rgba(167,139,250,0.12)",
  luxury: "rgba(244,114,182,0.12)",
  adr: "rgba(74,222,128,0.12)",
  agent: "rgba(251,146,60,0.12)",
};
export const badgeTextColors: Record<string, string> = {
  gold: "#fbbf24",
  vip: "#a78bfa",
  luxury: "#f472b6",
  adr: "#4ade80",
  agent: "#fb923c",
};
export const badgeLabels: Record<string, string> = {
  gold: "⭐ GOLD",
  vip: "💜 VIP",
  luxury: "💎 LUXURY",
  adr: "📱 ADR",
  agent: "🤝 ĐẠI LÝ",
};

export const featureList = [
  { color: "var(--accent-bright)", title: "Mở khóa tính năng Gold", desc: "Sử dụng toàn bộ các tính năng cao cấp của gói Locket Gold Premium vĩnh viễn." },
  { color: "var(--red)", title: "Không quảng cáo", desc: "Trải nghiệm mượt mà, sạch bóng không một cọng quảng cáo khó chịu." },
  { color: "var(--green)", title: "Upload ảnh từ thư viện", desc: "Lấy ảnh trực tiếp từ camera roll để gửi nhanh cho bạn bè thay vì chụp mới." },
  { color: "#F59E0B", title: "Quay video Lockets 15s", desc: "Quay video Lockets lên đến 15s (gói LUXURY) hoặc 3s (gói VIP & Android) cực sinh động." },
  { color: "#3B82F6", title: "Xem người đã xem Lockets", desc: "Xem danh sách những ai đã xem Lockets của bạn (hỗ trợ hệ điều hành iOS)." },
  { color: "#EC4899", title: "Thay đổi icon Locket", desc: "Làm mới màn hình chính với bộ icon ứng dụng Locket viền vàng Gold quyền lực." },
  { color: "#8B5CF6", title: "Thay đổi theme Locket", desc: "Cá nhân hóa màu sắc giao diện bên trong ứng dụng hoàn toàn theo sở thích." },
  { color: "#14B8A6", title: "Mở khóa giới hạn bạn bè", desc: "Xoá bỏ những rào cản, thêm vô số bạn bè xung quanh không bị giới hạn." },
  { color: "#10B981", title: "Tặng Canva Edu 3 Năm", desc: "Tất cả các gói đều được tặng kèm tài khoản Canva Edu bản quyền 3 năm (trị giá 60k)." },
  { color: "#F43F5E", title: "Mở khóa Addlocket.app", desc: "Được mở khóa toàn bộ tính năng cao cấp của hệ sinh thái website addlocket.app." },
];

export const stepsList = [
  { n: 1, color: "rgba(167,139,250,0.15)", textColor: "var(--accent-bright)", title: "Đăng Ký Tài Khoản", desc: "Tạo tài khoản miễn phí trên hệ thống để bắt đầu quá trình đồng bộ dữ liệu." },
  { n: 2, color: "rgba(244,114,182,0.15)", textColor: "#F472B6", title: "Nhập ID Locket", desc: "Cung cấp link trang cá nhân Locket. Hệ thống sẽ tự động tìm nạp thông tin hoàn toàn ẩn danh." },
  { n: 3, color: "rgba(52,211,153,0.15)", textColor: "var(--green)", title: "Tận Hưởng GOLD", desc: "Cài đặt DNS giữ Gold (iOS) hoặc sử dụng Hệ thống Auto-Renew (Android) và sử dụng ngay toàn bộ đặc quyền Gold vĩnh viễn." },
];

export const privilegesList = [
  { icon: "⭐", iconColor: "#fbbf24", badge: "Mở khóa", badgeType: "success", title: "Trải nghiệm toàn bộ Gold", desc: "Mở khóa các tính năng Gold Premium: gửi video (15s cho Luxury, 3s cho VIP và Android), tải ảnh từ thư viện, thay đổi icon & theme ứng dụng." },
  { icon: "⏱", iconColor: "#c4b5fd", badge: "Vĩnh viễn", badgeType: "info", title: "Thời hạn duy trì Premium", desc: "Mua một lần, sử dụng trọn đời. Cam kết không phát sinh thêm chi phí duy trì ẩn, không cần gia hạn theo gói tháng hay gói năm." },
  { icon: "🛡", iconColor: "#34d399", badge: "Ổn định", badgeType: "success", title: "Duy trì ổn định lâu dài", desc: "iOS: DNS đặc biệt chặn thu hồi chứng chỉ. Android: Hệ thống Auto-Renew tự động bơm Gold liên tục." },
  { icon: "📱", iconColor: "#60a5fa", badge: "Miễn phí", badgeType: "info", title: "Hỗ trợ chuyển đổi thiết bị", desc: "Khi đổi máy mới, hỗ trợ chuyển đổi cấu hình (iOS) hoặc cập nhật ID (Android) miễn phí." },
  { icon: "��", iconColor: "#f472b6", badge: "24/7", badgeType: "success", title: "Hỗ trợ kỹ thuật ưu tiên", desc: "Đội ngũ kỹ thuật viên hỗ trợ 24/7 qua Zalo và Telegram." },
  { icon: "🔒", iconColor: "#38bdf8", badge: "Bảo mật", badgeType: "info", title: "Bảo mật & Quyền riêng tư", desc: "Quy trình kích hoạt qua Username/Link công khai, không yêu cầu mật khẩu Locket hay iCloud." },
];
