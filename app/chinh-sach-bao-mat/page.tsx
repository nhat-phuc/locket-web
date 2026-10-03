import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách Bảo mật — Locket Gold",
  description: "Chính sách bảo mật thông tin khách hàng.",
};

export default function Page() {
  return (
    <main className="sub-page">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="sub-container">
        <div className="sub-badge">🔒 Bảo mật</div>
        <h1 className="sub-title">Chính sách Bảo mật</h1>
        <p className="sub-lead">
          Locket Gold tôn trọng quyền riêng tư và cam kết bảo vệ thông tin cá nhân của bạn.
        </p>

        <section className="sub-section">
          <h2>📋 Thông tin thu thập</h2>
          <ul className="sub-list-check">
            <li>Email đăng ký tài khoản</li>
            <li>Tên hiển thị, username Locket</li>
            <li>Lịch sử giao dịch, đơn hàng</li>
            <li>Địa chỉ IP, loại thiết bị</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>🎯 Mục đích sử dụng</h2>
          <ul className="sub-list-check">
            <li>Xử lý đơn hàng, kích hoạt gói</li>
            <li>Hỗ trợ kỹ thuật, bảo hành</li>
            <li>Gửi thông báo đơn hàng, khuyến mãi</li>
            <li>Phòng chống gian lận</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>🛡️ Bảo mật dữ liệu</h2>
          <ul className="sub-list-check">
            <li>Mật khẩu mã hóa (hash)</li>
            <li>Kết nối HTTPS toàn bộ website</li>
            <li>Backup định kỳ, server bảo mật</li>
            <li>Chỉ nhân viên ủy quyền truy cập</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>🚫 Chia sẻ thông tin</h2>
          <p>
            Chúng tôi <strong style={{ color: "#a78bfa" }}>KHÔNG</strong> bán, cho thuê
            hoặc chia sẻ thông tin cá nhân cho bên thứ ba, trừ khi:
          </p>
          <ul className="sub-list-check">
            <li>Có yêu cầu từ cơ quan pháp luật</li>
            <li>Cần thiết để xử lý thanh toán</li>
            <li>Bạn đồng ý rõ ràng bằng văn bản</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>🍪 Cookies</h2>
          <p>Website dùng cookies để ghi nhớ đăng nhập. Bạn có thể tắt trong trình duyệt.</p>
        </section>

        <section className="sub-section">
          <h2>👤 Quyền của bạn</h2>
          <ul className="sub-list-check">
            <li>Yêu cầu xem dữ liệu cá nhân</li>
            <li>Yêu cầu chỉnh sửa thông tin sai</li>
            <li>Yêu cầu xóa tài khoản và dữ liệu</li>
            <li>Từ chối nhận email marketing</li>
          </ul>
        </section>

        <div className="sub-cta">
          <div>
            <strong>Câu hỏi về bảo mật?</strong>
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
