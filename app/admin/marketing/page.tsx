"use client";

import { useState } from "react";

export default function AdminMarketingPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [role, setRole] = useState<"all" | "user" | "admin">("all");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSend = async () => {
    if (!subject || !content) {
      setErr("Nhập tiêu đề và nội dung");
      return;
    }
    if (!confirm(`Gửi email cho tất cả ${role}?`)) return;
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, role }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Đã gửi cho ${data.sent} người`);
        setSubject("");
        setContent("");
      } else setErr(data.message || "Lỗi");
    } catch {
      setErr("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="amk-page">
      <div className="amk-container">
        <h1 className="amk-title">📧 Email Marketing</h1>
        <p className="amk-sub">Gửi email hàng loạt cho user</p>

        <div className="amk-form">
          <label>Gửi cho</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="all">Tất cả</option>
            <option value="user">Chỉ user</option>
            <option value="admin">Chỉ admin</option>
          </select>

          <label>Tiêu đề</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Khuyến mãi..." />

          <label>Nội dung</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung..." rows={6} />

          {err && <div className="amk-err">⚠️ {err}</div>}
          {msg && <div className="amk-msg">✅ {msg}</div>}

          <button onClick={handleSend} disabled={loading} className="amk-btn">
            {loading ? "Đang gửi..." : "📧 Gửi email"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .amk-page { min-height: 100vh; padding: 32px 20px 80px; background: var(--bg-0); }
        .amk-container { max-width: 600px; margin: 0 auto; }
        .amk-title { font-size: 26px; font-weight: 900; color: var(--text-0); margin: 0 0 4px; }
        .amk-sub { font-size: 13px; color: var(--text-2); margin: 0 0 24px; }
        .amk-form { display: flex; flex-direction: column; gap: 10px; padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.7); border: 1.5px solid rgba(167,139,250,0.2); }
        .amk-form label { font-size: 12px; font-weight: 700; color: var(--text-0); margin-top: 4px; }
        .amk-form input, .amk-form select, .amk-form textarea { padding: 12px 16px; border-radius: 12px; background: #f2f2f7; border: 1.5px solid transparent; font-size: 14px; font-family: inherit; outline: none; resize: vertical; }
        .amk-form input:focus, .amk-form select:focus, .amk-form textarea:focus { background: #fff; border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,0.15); }
        .amk-err { padding: 10px; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 12px; font-weight: 600; }
        .amk-msg { padding: 10px; border-radius: 10px; background: rgba(34,197,94,0.08); color: #22c55e; font-size: 12px; font-weight: 600; }
        .amk-btn { padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg,#7c3aed,#a78bfa); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 8px; box-shadow: 0 8px 24px rgba(124,58,237,0.3); }
        .amk-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </main>
  );
}
