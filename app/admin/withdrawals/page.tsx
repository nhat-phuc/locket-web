"use client";

import { useEffect, useState } from "react";

interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountName: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    username: string;
    telegramId: string | null;
    phone: string | null;
  };
}

export default function AdminWithdrawalsPage() {
  const [list, setList] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "completed" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [actionType, setActionType] = useState<"approve" | "complete" | "reject">("approve");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${filter}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setList(d.list || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: actionType, adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Đã xử lý thành công");
        setSelected(null);
        setNote("");
        load();
      } else {
        showToast("error", data.message || "Lỗi");
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = list.filter(
    (w) =>
      (w.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.bankAccount || "").includes(search)
  );

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const statusLabels: Record<string, string> = {
    pending: "⏳ Chờ duyệt",
    approved: "✅ Đã duyệt",
    completed: "✓ Đã chuyển",
    rejected: "❌ Từ chối",
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--text-0)" }}>
        💸 Duyệt Rút Tiền
      </h1>
      <p style={{ color: "var(--text-2)", marginBottom: 20 }}>
        Xử lý yêu cầu rút tiền của người dùng
      </p>

      {toast && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 16,
          background: toast.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: toast.type === "success" ? "#10b981" : "#ef4444",
          fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["pending", "approved", "completed", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "10px 18px", borderRadius: 10, border: "1px solid",
              borderColor: filter === s ? "#a78bfa" : "var(--border)",
              background: filter === s ? "rgba(167,139,250,0.15)" : "transparent",
              color: filter === s ? "#a78bfa" : "var(--text-2)",
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {statusLabels[s] || "📋 Tất cả"}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="🔍 Tìm theo email, tên, STK..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%", maxWidth: 480, padding: "12px 16px", borderRadius: 12,
          border: "1px solid var(--border)", background: "var(--bg-1)",
          color: "var(--text-0)", fontSize: 14.5, fontFamily: "inherit",
          outline: "none", marginBottom: 20, boxSizing: "border-box",
        }}
      />

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Không có yêu cầu rút tiền</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((w) => (
            <div key={w.id} style={{
              background: "var(--bg-1)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 18,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
                    👤 {w.user?.name || w.user?.username || w.user?.email}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
                    📧 {w.user?.email}
                    {w.user?.phone && ` • 📱 ${w.user.phone}`}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 4 }}>
                    🕒 {new Date(w.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>
                    -{fmt(w.amount)}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, marginTop: 4,
                    background: w.status === "completed" ? "rgba(16,185,129,0.15)" : w.status === "rejected" ? "rgba(239,68,68,0.15)" : w.status === "approved" ? "rgba(59,130,246,0.15)" : "rgba(251,191,36,0.15)",
                    color: w.status === "completed" ? "#10b981" : w.status === "rejected" ? "#ef4444" : w.status === "approved" ? "#3b82f6" : "#fbbf24",
                    display: "inline-block",
                  }}>
                    {statusLabels[w.status] || w.status}
                  </div>
                </div>
              </div>

              <div style={{ padding: 12, background: "var(--bg-2)", borderRadius: 10, marginBottom: 12, fontSize: 13.5, lineHeight: 1.7 }}>
                <div>🏦 <b>{w.bankName}</b></div>
                <div>💳 STK: <code>{w.bankAccount}</code></div>
                <div>👤 Chủ TK: <b>{w.accountName}</b></div>
              </div>

              {w.adminNote && (
                <div style={{ padding: "8px 12px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, fontSize: 12.5, color: "#d97706", marginBottom: 12 }}>
                  📝 {w.adminNote}
                </div>
              )}

              {w.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setSelected(w); setActionType("approve"); setNote(""); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => { setSelected(w); setActionType("reject"); setNote(""); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}

              {w.status === "approved" && (
                <button
                  onClick={() => { setSelected(w); setActionType("complete"); setNote(""); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}
                >
                  💸 Đã chuyển khoản
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, maxWidth: 480, width: "100%" }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
              {actionType === "approve" ? "✅ Xác nhận duyệt" : actionType === "complete" ? "💸 Xác nhận đã chuyển khoản" : "❌ Xác nhận từ chối"}
            </h3>
            <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.7, color: "var(--text-1)" }}>
              <div>👤 <b>{selected.user?.name || selected.user?.username || selected.user?.email}</b></div>
              <div>💰 Số tiền: <b style={{ color: "#ef4444" }}>{fmt(selected.amount)}</b></div>
              <div>🏦 {selected.bankName} - {selected.bankAccount}</div>
              <div>👤 {selected.accountName}</div>
            </div>

            <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>Ghi chú (tùy chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đã chuyển lúc 15h30..."
              rows={3}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-0)", fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 16, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text-1)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Hủy
              </button>
              <button onClick={handleAction} disabled={submitting} style={{
                flex: 1, padding: "12px", borderRadius: 12, border: "none",
                background: actionType === "reject" ? "linear-gradient(135deg, #ef4444, #dc2626)" : actionType === "complete" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.6 : 1,
              }}>
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
