import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách Bảo hành — Locket Gold",
  description: "Chính sách bảo hành, hoàn tiền khi mua gói Locket Gold.",
};

export default function Page() {
  return (
    <main className="sub-page">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="sub-container">
        <div className="sub-badge">🛡️ Bảo hành</div>
        <h1 className="sub-title">Chính sách Bảo hành</h1>
        <p className="sub-lead">
          Locket Gold cam kết bảo hành đầy đủ cho mọi gói dịch vụ.
        </p>

        <section className="sub-section">
          <h2>⏱️ Thời hạn bảo hành</h2>
          <div className="sub-grid-4">
            <div className="sub-warranty">
              <div className="sub-w-time">1 tháng</div>
              <div className="sub-w-days">7 ngày BH</div>
            </div>
            <div className="sub-warranty">
              <div className="sub-w-time">3 tháng</div>
              <div className="sub-w-days">15 ngày BH</div>
            </div>
            <div className="sub-warranty">
              <div className="sub-w-time">6 tháng</div>
              <div className="sub-w-days">30 ngày BH</div>
            </div>
            <div className="sub-warranty featured">
              <div className="sub-w-time">12 tháng</div>
              <div className="sub-w-days">60 ngày BH</div>
            </div>
          </div>
        </section>

        <section className="sub-section">
          <h2>✅ Được bảo hành</h2>
          <ul className="sub-list-check">
            <li>Gói không kích hoạt được sau khi thanh toán</li>
            <li>Gói bị mất Gold giữa thời hạn</li>
            <li>Lỗi từ hệ thống Locket Gold</li>
            <li>Tài khoản bị khóa do lỗi hệ thống</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>❌ KHÔNG được bảo hành</h2>
          <ul className="sub-list-cross">
            <li>Tự ý đổi mật khẩu, iCloud, đăng xuất</li>
            <li>Chia sẻ tài khoản cho người khác</li>
            <li>Can thiệp, chỉnh sửa file hệ thống</li>
            <li>Tài khoản bị khóa do vi phạm điều khoản</li>
          </ul>
        </section>

        <section className="sub-section">
          <h2>🔄 Quy trình bảo hành</h2>
          <ol className="sub-steps">
            <li>Liên hệ Zalo <strong>0344421026</strong> kèm mã đơn hàng</li>
            <li>Cung cấp hình ảnh/video lỗi (nếu có)</li>
            <li>Kỹ thuật kiểm tra trong 24h</li>
            <li>Nếu đủ điều kiện → kích hoạt lại hoặc hoàn tiền</li>
          </ol>
        </section>

        <section className="sub-section">
          <h2>💰 Hoàn tiền</h2>
          <p>
            Nếu không thể khắc phục, Locket Gold hoàn{" "}
            <strong style={{ color: "#a78bfa" }}>100%</strong> số tiền đã thanh toán
            vào ví hoặc chuyển khoản trong 3 ngày làm việc.
          </p>
        </section>

        <div className="sub-cta">
          <div>
            <strong>Cần bảo hành?</strong>
            <span>Nhắn Zalo kèm mã đơn hàng</span>
          </div>
          <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer" className="sub-cta-btn">
            Liên hệ ngay →
          </a>
        </div>
      </div>
    </main>
  );
}
