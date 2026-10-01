"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TaiKhoanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      // 1. Check sessionStorage trước (nhanh)
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

      // 2. Không có local → verify với cookie session qua API
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success && data.user) {
          // Cookie còn valid → lưu lại sessionStorage và cho vào
          sessionStorage.setItem("locket_user", JSON.stringify(data.user));
          if (!cancelled) setChecked(true);
          return;
        }
      } catch (err) {
        console.error("[tai-khoan] verify failed:", err);
      }

      // 3. Không có cả 2 → đá về đăng nhập
      if (!cancelled) router.push("/dang-nhap");
    };

    verifyAuth();

    return () => {
      cancelled = true;
    };
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
