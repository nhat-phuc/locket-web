"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) setError("Thiếu email. Vui lòng quay lại.");
  }, [email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/dat-lai-mat-khau?token=${data.resetToken}`);
      } else {
        setError(data.error || "Mã OTP không đúng");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResendCooldown(60);
        if (data.devOtp) alert(`🔗 Dev OTP: ${data.devOtp}`);
      } else {
        setError(data.error || "Không thể gửi lại");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-form">
        <h1 className="auth-title">Lỗi</h1>
        <p className="auth-sub">Thiếu email.</p>
        <Link href="/quen-mat-khau" className="auth-btn" style={{ display: "block", textAlign: "center" }}>
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1 className="auth-title">Nhập Mã OTP</h1>
      <p className="auth-sub">
        Mã 6 số đã gửi đến <strong>{email}</strong>
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Mã OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
            disabled={loading}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            style={{
              fontSize: 24,
              letterSpacing: 8,
              textAlign: "center",
              fontWeight: 700,
            }}
          />
          <small style={{ color: "var(--text-2)", fontSize: 12 }}>
            Mã có hiệu lực 10 phút
          </small>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Đang xác minh..." : "Xác Minh"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-bright)",
              cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown}s`
              : resendLoading
              ? "Đang gửi..."
              : "Gửi lại mã OTP"}
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          <Link href="/quen-mat-khau" style={{ color: "var(--accent-bright)" }}>
            ← Đổi email khác
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NhapOtpPage() {
  return (
    <>
      <main className="wrap center-y" style={{ minHeight: "60vh", paddingTop: 60, paddingBottom: 60 }}>
        <div className="page-shell" style={{ maxWidth: 480 }}>
          <Suspense fallback={<div className="auth-form">Đang tải...</div>}>
            <OtpForm />
          </Suspense>
        </div>
      </main>
      <Navbar />
    </>
  );
}
