
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
// 

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Link không hợp lệ");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dang-nhap"), 2500);
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div style={{ textAlign: "center", color: "var(--green)", padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <strong style={{ display: "block", marginBottom: 8, fontSize: 18 }}>
            Đặt lại mật khẩu thành công!
          </strong>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Đang chuyển đến trang đăng nhập...
          </p>
          <Link href="/dang-nhap" style={{ color: "var(--accent-bright)", fontWeight: 700 }}>
            Đăng nhập ngay →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1 className="auth-title">Đặt Lại Mật Khẩu</h1>
      <p className="auth-sub">Nhập mật khẩu mới cho tài khoản của bạn</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ít nhất 6 ký tự"
            required
            disabled={loading || !token}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            required
            disabled={loading || !token}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || !token || !password || !confirm}
        >
          {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
        </button>

        <div className="auth-footer">
          <Link href="/dang-nhap" style={{ color: "var(--accent-bright)" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function DatLaiMatKhauPage() {
  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ minHeight: "60vh", paddingTop: 60, paddingBottom: 60 }}>
        <div className="page-shell" style={{ maxWidth: 480 }}>
          <Suspense fallback={<div className="auth-form">Đang tải...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
      <Navbar />
      {/*  */}
    </>
  );
}
