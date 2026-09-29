import Link from "next/link";
// 
import LoginForm from "@/components/LoginForm";

export default function DangNhapPage() {
  return (
    <>
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <div style={{ width: "100%", maxWidth: 440, marginTop: 40, marginBottom: 60 }}>
          <LoginForm />
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-2)" }}>
            <Link href="/" style={{ color: "var(--accent-bright)" }}>← Về trang chủ</Link>
          </p>
        </div>
      </main>
      {/*  */}
    </>
  );
}
