"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>⚠️</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: "var(--text-0)" }}>
          Đã xảy ra lỗi
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 32, lineHeight: 1.6 }}>
          Có lỗi xảy ra khi tải trang. Vui lòng thử lại.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 12px 32px rgba(167,139,250,0.4)",
          }}
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
