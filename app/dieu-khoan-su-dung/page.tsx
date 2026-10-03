import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản Sử dụng — Locket Gold",
  description: "Điều khoản sử dụng dịch vụ Locket Gold.",
};

export default function Page() {
  return (
    <main className="sub-page">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="sub-container">
        <div className="sub-badge">📜 Pháp lý</div>
        <h1 className="sub-title">Điều khoản Sử dụng</h1>
        <p className="sub-lead">
          Khi sử dụng dịch vụ Locket Gold, bạn đồng ý tuân thủ các điều khoản dưới đây.
        </p>

        <section className="sub-section">
          <h2>1. Chấp nhận điều khoản</h2>
          <p>Bằng việc truy cập và mua gói Locket Gold, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ điều khoản này.</p>
        </section>

        <section className="sub-section">
          <h2>2. Quyền và nghĩa vụ người dùng</h2>
          <ul className="sub-list-check">
            <li>Không chia sẻ, bán lại tài khoản</li>
            <li>Không dùng dịch vụ vào mục đích vi phạm pháp luật</li>
            <li>Bảo mật thông tin đăng nhập</li>
            <li>Chịu trách nhiệm mọi hoạt động trên tài khoản</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>3. Quyền của Locket Gold</h2>
          <ul className="sub-list-check">
            <li>Từ chối phục vụ nếu phát hiện gian lận</li>
            <li>Khóa tài khoản vi phạm không cần báo trước</li>
            <li>Thay đổi giá, tính năng (có thông báo trước)</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>4. Thanh toán và hoàn tiền</h2>
          <p>Thanh toán xử lý tự động. Hoàn tiền theo <a href="/chinh-sach-bao-hanh">Chính sách Bảo hành</a>.</p>
        </section>

        <section className="sub-section">
          <h2>5. Giới hạn trách nhiệm</h2>
          <p>Locket Gold không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.</p>
        </section>

        <section className="sub-section">
          <h2>6. Thay đổi điều khoản</h2>
          <p>Locket Gold có thể cập nhật điều khoản bất kỳ lúc nào. Phiên bản mới sẽ được thông báo trên website.</p>
        </section>

        <div className="sub-cta">
          <div>
            <strong>Cần hỗ trợ?</strong>
            <span>Liên hệ qua Zalo</span>
          </div>
          <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer" className="sub-cta-btn">
            0344421026 →
          </a>
        </div>
      </div>
    </main>
  );
}
