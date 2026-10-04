"use client";
import { useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const send = async () => {
    setSending(true); setMsg("");
    try {
      const r = await fetch("/api/admin/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, content }) });
      const d = await r.json();
      setMsg(d.success ? "✅ " + d.message : "❌ " + d.message);
    } catch { setMsg("❌ Lỗi kết nối"); }
    finally { setSending(false); }
  };
  return (
    <AdminPage title="Email marketing" description="Gửi email hàng loạt cho người dùng">
      {msg && <div style={{ padding: 12, borderRadius: 12, marginBottom: 16, background: msg.startsWith("✅") ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)", color: msg.startsWith("✅") ? "#34d399" : "#f87171" }}>{msg}</div>}
      <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tiêu đề</label>
          <input className="admin-btn" style={{ width: "100%", textAlign: "left" }} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Khuyến mãi tháng 10..." />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nội dung</label>
          <textarea className="admin-btn" style={{ width: "100%", minHeight: 200, textAlign: "left", fontFamily: "inherit" }} value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung email..." />
        </div>
        <button onClick={send} disabled={sending || !subject || !content} className="admin-btn" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontWeight: 700, borderColor: "transparent" }}>
          {sending ? "Đang gửi..." : "📧 Gửi email"}
        </button>
      </div>
    </AdminPage>
  );
}
