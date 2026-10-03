import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNS là gì? — Locket Gold",
  description: "Tìm hiểu DNS và cách đổi DNS để dùng Locket Gold ổn định.",
};

export default function Page() {
  return (
    <main className="sub-page">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="sub-container">
        <div className="sub-badge">📖 Kiến thức</div>
        <h1 className="sub-title">DNS là gì?</h1>
        <p className="sub-lead">
          DNS là "danh bạ" của Internet — giúp chuyển tên miền dễ nhớ
          (như <code>locketgold.app</code>) thành địa chỉ IP máy tính hiểu được.
        </p>

        <section className="sub-section">
          <h2>⚡ Vì sao cần đổi DNS?</h2>
          <div className="sub-grid-3">
            <div className="sub-mini-card">🚀 Kết nối ổn định hơn</div>
            <div className="sub-mini-card">📸 Tải ảnh nhanh hơn</div>
            <div className="sub-mini-card">🛡️ Tránh bị chặn</div>
          </div>
        </section>

        <section className="sub-section">
          <h2>🌐 DNS nên dùng</h2>
          <div className="sub-grid-2">
            <div className="sub-dns-card">
              <div className="sub-icon">🔵</div>
              <h3>Google DNS</h3>
              <p><strong>8.8.8.8</strong></p>
              <p><strong>8.8.4.4</strong></p>
            </div>
            <div className="sub-dns-card">
              <div className="sub-icon">🟠</div>
              <h3>Cloudflare DNS</h3>
              <p><strong>1.1.1.1</strong></p>
              <p><strong>1.0.0.1</strong></p>
            </div>
          </div>
        </section>

        <section className="sub-section">
          <h2>📱 Hướng dẫn iOS</h2>
          <ol className="sub-steps">
            <li>Mở <strong>Cài đặt</strong> → <strong>Wi-Fi</strong></li>
            <li>Bấm tên Wi-Fi → <strong>Cấu hình DNS</strong></li>
            <li>Chuyển sang <strong>Thủ công</strong> → <strong>Thêm máy chủ</strong></li>
            <li>Nhập <code>8.8.8.8</code> và <code>8.8.4.4</code></li>
            <li>Bấm <strong>Lưu</strong> → tắt/bật Wi-Fi</li>
          </ol>
        </section>

        <section className="sub-section">
          <h2>�� Hướng dẫn Android</h2>
          <ol className="sub-steps">
            <li>Mở <strong>Cài đặt</strong> → <strong>Wi-Fi</strong></li>
            <li>Giữ tên Wi-Fi → <strong>Sửa mạng</strong></li>
            <li>Mở <strong>Tùy chọn nâng cao</strong> → <strong>IP</strong> → <strong>Tĩnh</strong></li>
            <li>DNS 1: <code>8.8.8.8</code>, DNS 2: <code>8.8.4.4</code></li>
            <li>Bấm <strong>Lưu</strong></li>
          </ol>
        </section>

        <div className="sub-cta">
          <div>
            <strong>Cần hỗ trợ?</strong>
            <span>Liên hệ ngay qua Zalo</span>
          </div>
          <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer" className="sub-cta-btn">
            0344421026 →
          </a>
        </div>
      </div>
    </main>
  );
}
