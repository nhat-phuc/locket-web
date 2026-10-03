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
        style={{
          padding: "10px 18px",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        + Gửi thông báo mới
      </button>

      {open && (
        <div
          onClick={() => !loading && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800 }}>
              📢 Gửi thông báo
            </h3>

            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Tiêu đề
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Khuyến mãi 20%"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                marginBottom: 14,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung thông báo..."
              rows={5}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                marginBottom: 14,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Loại
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 14,
                outline: "none",
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="info">ℹ️ Thông tin</option>
              <option value="success">🎉 Thành công</option>
              <option value="warning">⚠️ Cảnh báo</option>
              <option value="error">❌ Lỗi</option>
            </select>

            {msg && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 13,
                  background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                  color: msg.startsWith("✅") ? "#10b981" : "#dc2626",
                }}
              >
                {msg}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                style={{
                  padding: 14,
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  padding: 14,
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
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
