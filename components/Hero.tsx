import Link from "next/link";

export default function Hero() {
  return (
    <div className="hero-grid">
      <div className="hero-text-col">
        <h1 className="hero-title">
          Hệ Thống Nâng Cấp
          <br />
          <span className="gradient">LocketGold Tự Động</span>
        </h1>
        <div className="hero-intro">
          Độc quyền tại{" "}
          <strong>
            <Link
              href="/"
              style={{ color: "var(--accent-bright)", fontWeight: 700 }}
            >
              locketgold.app
            </Link>
          </strong>{" "}
          — Nền tảng tự động nâng cấp Locket Gold chỉ cần username là đủ lên
          gold. Quy trình được mã hóa, tuyệt đối bảo vệ quyền riêng tư của khách
          hàng với <strong>cam kết 100% quy tắc 3 KHÔNG:</strong>
        </div>

        <div className="hero-features">
          {[
            "yêu cầu đăng nhập iCloud hay can thiệp vào thiết bị.",
            "cần cung cấp tài khoản hay mật khẩu Locket của bạn.",
            "yêu cầu tải Shadowrocket thao tác cực kì đơn giản và dễ dàng.",
          ].map((text, i) => (
            <div key={i} className="hero-feature-item">
              <div className="hero-feature-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="hero-feature-text">
                <strong>KHÔNG</strong> {text}
              </div>
            </div>
          ))}
        </div>

        <div className="hero-badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <div>
            <strong
              style={{ display: "block", marginBottom: 4, fontSize: 15 }}
            >
              Hệ thống hỗ trợ toàn diện: Android &amp; iOS
            </strong>
          </div>
        </div>
      </div>
      <div className="hero-image-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo/banner.jpg" alt="LocketGold App" />
      </div>
    </div>
  );
}
