"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GioiThieuLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      const stored = sessionStorage.getItem("locket_user");
      if (stored) {
        try {
          JSON.parse(stored);
          if (!cancelled) setChecked(true);
          return;
        } catch {
          sessionStorage.removeItem("locket_user");
        }
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.success && data.user) {
          sessionStorage.setItem("locket_user", JSON.stringify(data.user));
          if (!cancelled) setChecked(true);
          return;
        }
      } catch (err) {
        console.error("[gioi-thieu] verify failed:", err);
      }

      if (!cancelled) router.push("/dang-nhap");
    };

    verifyAuth();
    return () => { cancelled = true; };
  }, [router]);

  if (!checked) {
    return (
      <main className="wrap" style={{ minHeight: "80vh", paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ minHeight: "80vh", paddingTop: 32, paddingBottom: 60 }}>
      {children}
    </main>
  );
}
