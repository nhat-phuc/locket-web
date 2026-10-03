"use client";

import { useEffect, useState } from "react";

interface Invited {
  id: string;
  username: string;
  name: string | null;
  createdAt: string;
}

export default function GioiThieuPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [balance, setBalance] = useState(0);
  const [totalInvited, setTotalInvited] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [invited, setInvited] = useState<Invited[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      const d = await r.json();
      if (d.success && d.user) {
        setLoggedIn(true);
        loadStats();
      } else {
        setLoggedIn(false);
      }
    } catch {
      setLoggedIn(false);
    }
  }

  async function loadStats() {
    const r = await fetch("/api/referral/stats", { credentials: "include" });
    const d = await r.json();
    if (d.success) {
      setCode(d.referralCode);
      setBalance(d.balance);
      setTotalInvited(d.totalInvited);
      setTotalBonus(d.totalBonus);
      setInvited(d.invited || []);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (d.success) {
        sessionStorage.setItem("locket_user", JSON.stringify(d.user || {}));
        setLoggedIn(true);
        loadStats();
      } else {
        setLoginError(d.message || "Đăng nhập thất bại");
      }
    } catch {
      setLoginError("Lỗi kết nối");
    }
    setLoginLoading(false);
  }

  const link = `${origin}/dang-ky?ref=${code}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loggedIn === null) {
    return <main className="wrap center-y" style={{ minHeight: "60vh" }}><p>Đang tải...</p></main>;
  }

  // ❌ Chưa login → form login
  if (!loggedIn) {
    return (
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <div style={{ width: "100%", maxWidth: 440, marginTop: 40, marginBottom: 60 }}>
          <div className="auth-form">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-sub">Đăng nhập để nhận link giới thiệu & hoa hồng</p>

            {loginError && <div className="auth-error">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="auth-field">
                <label>Email <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Mật khẩu <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loginLoading}>
                {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="auth-footer">
              Chưa có tài khoản? <a href="/dang-ky">Đăng ký ngay</a>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Đã login → hiện link + thống kê
  return (
    <main className="wrap" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 56 }}>🎁</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "12px 0" }}>Giới Thiệu Nhận Quà</h1>
        <p style={{ color: "#666" }}>
          Chia sẻ link của bạn. Mỗi người đăng ký thành công, bạn nhận ngay <b>10.000đ</b>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#eff6ff", padding: 16, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Số dư</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>
            {balance.toLocaleString("vi-VN")}đ
          </div>
        </div>
        <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Đã mời</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{totalInvited}</div>
        </div>
        <div style={{ background: "#fefce8", padding: 16, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Hoa hồng</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#ca8a04" }}>
            {totalBonus.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)",
        border: "1px solid #fbcfe8",
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🔗 Link giới thiệu của bạn:</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            style={{ flex: 1, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
          />
          <button
            onClick={copy}
            style={{ padding: "10px 20px", background: "#2563eb", color: "white", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            {copied ? "✅ Đã copy" : "Copy"}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>👥 Đã mời ({totalInvited})</h2>
      {invited.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center", padding: 32, background: "#f9fafb", borderRadius: 12 }}>
          Chưa có ai đăng ký qua link của bạn.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {invited.map((u) => (
            <div key={u.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 8,
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{u.name || u.username}</div>
                <div style={{ fontSize: 13, color: "#888" }}>@{u.username}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, color: "#16a34a", fontWeight: 600 }}>+10.000đ</div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
