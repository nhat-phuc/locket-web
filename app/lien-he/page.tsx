"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LienHePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setName(u.name || u.username || "");
        setEmail(u.email || "");
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) {
        setSubject("");
        setMessage("");
      }
    } catch {
      setResult({ success: false, message: "Lỗi kết nối" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="page-shell">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, background: "linear-gradient(135deg, var(--accent), var(--accent-bright))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Liên hệ với chúng tôi
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>Hỗ trợ 24/7 qua Zalo, Telegram hoặc form bên dưới</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Kênh hỗ trợ</h2>
              {[
                { icon: "💬", label: "Zalo", value: "0344 421 026", href: "https://zalo.me/0344421026" },
                { icon: "📢", label: "Telegram", value: "@hethonglocket", href: "https://t.me/hethonglocket" },
                { icon: "📧", label: "Email", value: "support@locketgold.app", href: "mailto:support@locketgold.app" },
                { icon: "🌐", label: "Website", value: "locketgold.app", href: "https://locketgold.app" },
              ].map((c, i) => (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.value}</div>
                  </div>
                </a>
              ))}

              <div style={{ marginTop: 24, padding: 16, background: "rgba(167,139,250,.08)", border: "1px solid rgba(167,139,250,.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-bright)", marginBottom: 6 }}>⏰ Thời gian hỗ trợ</div>
                <div style={{ fontSize: 13, color: "var(--text-1)" }}>24/7 — Kể cả ngày lễ, Tết</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Gửi tin nhắn</h2>

              {result && (
                <div style={{ padding: 12, borderRadius: 10, background: result.success ? "rgba(52,211,153,.1)" : "rgba(248,113,113,.1)", color: result.success ? "#34d399" : "#f87171", marginBottom: 16, fontSize: 14 }}>
                  {result.message}
                </div>
              )}

              <div className="auth-field">
                <label>Tên <span style={{ color: "var(--red)" }}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="auth-field">
                <label>Email <span style={{ color: "var(--red)" }}>*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="auth-field">
                <label>Số điện thoại</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" />
              </div>

              <div className="auth-field">
                <label>Tiêu đề</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Vấn đề cần hỗ trợ" />
              </div>

              <div className="auth-field">
                <label>Nội dung <span style={{ color: "var(--red)" }}>*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Mô tả chi tiết vấn đề..."
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "var(--bg-2)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--text-0)",
                    fontSize: 15,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Đang gửi..." : "Gửi tin nhắn"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
