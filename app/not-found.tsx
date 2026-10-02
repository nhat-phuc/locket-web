import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        flexDirection: "column",
      }}
    >
      {/* Số 404 lớn với gradient */}
      <h1
        style={{
          fontSize: "clamp(80px, 20vw, 160px)",
          fontWeight: 900,
          margin: 0,
          lineHeight: 1,
          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </h1>

      {/* Icon */}
      <div
        style={{
          fontSize: 60,
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        🔍
      </div>

      {/* Tiêu đề */}
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 12,
          color: "var(--text-1, #111827)",
        }}
      >
        Không tìm thấy trang
      </h2>

      {/* Mô tả */}
      <p
        style={{
          fontSize: 15,
          color: "var(--text-2, #6b7280)",
          maxWidth: 420,
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
      </p>

      {/* Nút quay về */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "12px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
          }}
        >
          🏠 Về trang chủ
        </Link>

        <Link
          href="/tai-khoan"
          style={{
            padding: "12px 28px",
            borderRadius: 12,
            background: "transparent",
            color: "var(--text-1, #111827)",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
            border: "2px solid var(--border, #e5e7eb)",
          }}
        >
          👤 Tài khoản
        </Link>
      </div>
    </div>
  );
}
