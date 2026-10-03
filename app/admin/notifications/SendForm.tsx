"use client";

import { useState } from "react";

export default function SendForm({ onSent }: { onSent: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setMsg("❌ Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "all", title, content, type }),
      });
      const d = await r.json();
      if (d.success) {
        setMsg(`✅ Đã gửi cho ${d.count} user`);
        setTitle("");
        setContent("");
        setType("info");
        setTimeout(() => {
          setOpen(false);
          setMsg("");
          onSent();
        }, 1500);
      } else {
        setMsg("❌ " + (d.message || "Lỗi"));
      }
    } catch {
      setMsg("❌ Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="admin-btn admin-btn-primary notif-send-btn"
      >
        <span>📢</span>
        <span>Gửi thông báo mới</span>
      </button>

      {open && (
        <div className="admin-modal-overlay" onClick={() => !loading && setOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">📢 Gửi thông báo</h3>

            <label className="admin-label">Tiêu đề</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Khuyến mãi 20%"
              className="admin-input"
            />

            <label className="admin-label">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung thông báo..."
              rows={5}
              className="admin-input admin-textarea"
            />

            <label className="admin-label">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="admin-input"
            >
              <option value="info">ℹ️ Thông tin</option>
              <option value="success">🎉 Thành công</option>
              <option value="warning">⚠️ Cảnh báo</option>
              <option value="error">❌ Lỗi</option>
            </select>

            {msg && (
              <div className={`admin-alert ${msg.startsWith("✅") ? "success" : "error"}`}>
                {msg}
              </div>
            )}

            <div className="admin-modal-actions">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="admin-btn"
              >
                Hủy
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="admin-btn admin-btn-primary"
              >
                {loading ? "Đang gửi..." : "Gửi cho tất cả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
