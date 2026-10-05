"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const TYPES = [
  { value: "info", label: "ℹ️ Thông tin", color: "#3b82f6", bg: "#dbeafe" },
  { value: "success", label: "✅ Thành công", color: "#10b981", bg: "#d1fae5" },
  { value: "warning", label: "⚠️ Cảnh báo", color: "#f59e0b", bg: "#fef3c7" },
  { value: "error", label: "❌ Lỗi", color: "#ef4444", bg: "#fee2e2" },
];

export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setLoading(true);
    fetch("/api/notifications?limit=20")
      .then((r) => r.json())
      .then((d) => {
        // API có thể trả về: { notification: {...} } HOẶC { notifications: [...] } HOẶC [...]
        let items: Notification[] = [];
        if (Array.isArray(d?.notifications)) {
          items = d.notifications;
        } else if (Array.isArray(d)) {
          items = d;
        } else if (d?.notification && typeof d.notification === "object") {
          items = [d.notification];
        } else if (d?.id && d?.title) {
          items = [d];
        }
        setHistory(items);
      })
      .catch((err) => {
        console.error("[loadHistory]", err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const send = async () => {
    if (!title.trim() || !content.trim()) {
      setMsg("❌ Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type }),
      });
      const d = await r.json();
      if (d.success) {
        setMsg("✅ " + (d.message || "Đã gửi thông báo"));
        setTitle("");
        setContent("");
        setType("info");
        loadHistory();
      } else {
        setMsg("❌ " + (d.message || "Lỗi"));
      }
    } catch {
      setMsg("❌ Lỗi kết nối");
    } finally {
      setSending(false);
    }
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AdminPage title="🔔 Thông báo" description="Gửi thông báo cho tất cả người dùng">
      {/* Toast */}
      {msg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 20,
            background: msg.startsWith("✅") ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${msg.startsWith("✅") ? "#86efac" : "#fecaca"}`,
            color: msg.startsWith("✅") ? "#059669" : "#dc2626",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ═══ FORM GỬI ═══ */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              marginBottom: 20,
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            ✏️ Tạo thông báo mới
          </h2>

          {/* Loại thông báo */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              Loại thông báo
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    padding: "8px 14px",
                    background: type === t.value ? t.bg : "#f8fafc",
                    color: type === t.value ? t.color : "#64748b",
                    border: `1.5px solid ${type === t.value ? t.color : "#e2e8f0"}`,
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              Tiêu đề <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Khuyến mãi tháng 10"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Nội dung */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              Nội dung <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                color: "#0f172a",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>
              {content.length} ký tự
            </div>
          </div>

          {/* Nút gửi */}
          <button
            onClick={send}
            disabled={sending || !title.trim() || !content.trim()}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: sending
                ? "#94a3b8"
                : "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14.5,
              cursor: sending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
              transition: "all 0.2s",
              opacity: !title.trim() || !content.trim() ? 0.5 : 1,
            }}
          >
            {sending ? "⏳ Đang gửi..." : "🔔 Gửi thông báo"}
          </button>
        </div>

        {/* ═══ LỊCH SỬ ═══ */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              marginBottom: 20,
              marginTop: 0,
              color: "#0f172a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>📜 Đã gửi gần đây</span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#64748b",
                background: "#f1f5f9",
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              {history.length}
            </span>
          </h2>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
              Đang tải...
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#94a3b8",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px dashed #e2e8f0",
              }}
            >
              📭 Chưa có thông báo nào
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxHeight: 600,
                overflowY: "auto",
              }}
            >
              {history.map((n) => {
                const t = TYPES.find((x) => x.value === n.type) || TYPES[0];
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: 14,
                      background: "#f8fafc",
                      border: `1px solid #e2e8f0`,
                      borderLeft: `3px solid ${t.color}`,
                      borderRadius: 10,
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                      >
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: t.bg,
                          color: t.color,
                          flexShrink: 0,
                        }}
                      >
                        {t.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {n.content}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      🕒 {fmtDate(n.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
