import Link from "next/link";
// 

export default function ThatBaiPage() {
  return (
    <>
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>❌</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: "var(--red)" }}>Thanh toán thất bại</h1>
          <p style={{ color: "var(--text-2)", marginBottom: 32, lineHeight: 1.6 }}>
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/thanh-toan" style={{ padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--accent-bright))", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
              Thử lại
            </Link>
            <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer" style={{ padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-1)", textDecoration: "none", fontWeight: 600 }}>
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </main>
      {/*  */}
    </>
  );
}
