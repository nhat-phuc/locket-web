"use client";
import { useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const send = async () => {
    setSending(true); setMsg("");
    try {
      const r = await fetch("/api/admin/notifications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content }) });
      const d = await r.json();
      setMsg(d.success ? "✅ " + d.message : "❌ " + d.message);
    } catch { setMsg("❌ Lỗi kết nối"); }
    finally { setSending(false); }
  };
  return (
    <AdminPage title="Thông báo" description="Gửi thông báo cho tất cả người dùng">
      {msg && <div style={{ padding: 12, borderRadius: 12, marginBottom: 16, background: msg.startsWith("✅") ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)", color: msg.startsWith("✅") ? "#34d399" : "#f87171" }}>{msg}</div>}
      <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tiêu đề</label>
          <input className="admin-btn" style={{ width: "100%", textAlign: "left" }} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nội dung</label>
          <textarea className="admin-btn" style={{ width: "100%", minHeight: 140, textAlign: "left", fontFamily: "inherit" }} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <button onClick={send} disabled={sending || !title || !content} className="admin-btn" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontWeight: 700, borderColor: "transparent" }}>
          {sending ? "Đang gửi..." : "🔔 Gửi thông báo"}
        </button>
      </div>
    </AdminPage>
  );
}
