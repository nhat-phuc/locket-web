import Link from "next/link";
import Header from "@/components/Header";
// 

export default function ThanhCongPage() {
  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: "#16a34a" }}>Thanh toán thành công!</h1>
          <p style={{ color: "var(--text-2)", marginBottom: 32, lineHeight: 1.6 }}>
            Đơn hàng của bạn đã được xác nhận. Hệ thống đang xử lý và sẽ cập nhật trạng thái trong thời gian sớm nhất.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/tai-khoan/don-hang" style={{ padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--accent-bright))", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
              Xem đơn hàng
            </Link>
            <Link href="/" style={{ padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-1)", textDecoration: "none", fontWeight: 600 }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
      {/*  */}
    </>
  );
}
