import Link from "next/link";

export default function CTA() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 40,
      }}
    >
      <Link
        href="/dang-ky"
        className="btn-primary-custom"
        style={{
          padding: "16px 36px",
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          background: "linear-gradient(135deg, var(--accent), var(--accent-bright))",
          color: "#fff",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 8px 32px var(--accent-glow)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        Tạo Tài Khoản Miễn Phí
      </Link>

      <Link
        href="/bang-gia"
        style={{
          padding: "16px 36px",
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 600,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--text-1)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Xem Bảng Giá VIP
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: 4 }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}
