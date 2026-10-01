import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12, color: "var(--text-0)" }}>404</h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 32, lineHeight: 1.6 }}>
          Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 800,
            boxShadow: "0 12px 32px rgba(167,139,250,0.4)",
          }}
        >
          ← Về trang chủ
        </Link>
      </div>
    </main>
  );
}
