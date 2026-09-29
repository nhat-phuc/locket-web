import Link from "next/link";
// 
import RegisterForm from "@/components/RegisterForm";

export default function DangKyPage() {
  return (
    <>
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <div style={{ width: "100%", maxWidth: 440, marginTop: 40, marginBottom: 60 }}>
          <RegisterForm />
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-2)" }}>
            <Link href="/" style={{ color: "var(--accent-bright)" }}>← Về trang chủ</Link>
          </p>
        </div>
      </main>
      {/*  */}
    </>
  );
}
