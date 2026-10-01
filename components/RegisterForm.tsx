"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone
    if (!/^0\d{9}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, name, phone }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("locket_user", JSON.stringify(data.user));
        router.push("/tai-khoan");
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className="auth-title">Đăng ký</h1>
      <p className="auth-sub">Tạo tài khoản miễn phí để bắt đầu</p>

      {error && <div className="auth-error">{error}</div>}

      <GoogleLoginButton />

      <div className="auth-field" style={{ marginTop: 20 }}>
        <label>
          Email <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label>
          Username <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
        />
        <small style={{ color: "var(--text-2)", fontSize: 12 }}>
          Chỉ chứa chữ, số, gạch dưới (3-20 ký tự)
        </small>
      </div>

      <div className="auth-field">
        <label>Tên hiển thị</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="auth-field">
        <label>
          Số điện thoại <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="0912345678"
          required
          pattern="0[0-9]{9}"
          maxLength={10}
          autoComplete="tel"
          inputMode="numeric"
        />
        <small style={{ color: "var(--text-2)", fontSize: 12 }}>
          10 số, bắt đầu bằng 0
        </small>
      </div>

      <div className="auth-field">
        <label>
          Mật khẩu <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="auth-field">
        <label>
          Xác nhận mật khẩu <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" disabled={loading} className="auth-btn">
        {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
      </button>

      <p className="auth-footer">
        Đã có tài khoản?{" "}
        <Link
          href="/dang-nhap"
          style={{ color: "var(--accent-bright)", fontWeight: 700 }}
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
