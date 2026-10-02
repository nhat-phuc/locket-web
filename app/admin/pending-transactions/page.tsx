"use client";

import { useEffect, useState } from "react";

interface PendingTx {
  id: string;
  sepayId: string | null;
  orderCode: string | null;
  orderId: string | null;
  amount: number;
  content: string | null;
  referenceCode: string | null;
  bankAccount: string | null;
  gateway: string | null;
  transactionDate: string | null;
  reason: string;
  status: string;
  note: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function PendingTransactionsPage() {
  const [items, setItems] = useState<PendingTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "resolved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PendingTx | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/pending-transactions?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.items || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: "resolve" | "reject") => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pending-transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, action, note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Thành công");
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

  const filtered = items.filter(
    (i) =>
      (i.orderCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.content || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.referenceCode || "").toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--text-0)" }}>
        💳 Giao dịch chờ xử lý
      </h1>
      <p style={{ color: "var(--text-2)", marginBottom: 20 }}>
        Duyệt các giao dịch chuyển khoản từ SePay không khớp tự động
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

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["pending", "resolved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid",
              borderColor: filter === s ? "#a78bfa" : "var(--border)",
              background: filter === s ? "rgba(167,139,250,0.15)" : "transparent",
              color: filter === s ? "#a78bfa" : "var(--text-2)",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {s === "pending" ? "⏳ Chờ xử lý" : s === "resolved" ? "✅ Đã duyệt" : "❌ Từ chối"}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo orderCode, content, referenceCode..."
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>��</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Không có giao dịch nào</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((tx) => (
            <div key={tx.id} style={{
              background: "var(--bg-1)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 18,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#a78bfa", fontSize: 14, marginBottom: 4 }}>
                    {tx.orderCode || "—"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                    {tx.gateway || "—"} • {tx.transactionDate ? new Date(tx.transactionDate).toLocaleString("vi-VN") : new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#10b981" }}>
                  +{fmt(tx.amount)}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, fontSize: 13, marginBottom: 12 }}>
                <div><span style={{ color: "var(--text-2)" }}>Nội dung: </span><strong>{tx.content || "—"}</strong></div>
                <div><span style={{ color: "var(--text-2)" }}>Tham chiếu: </span><strong>{tx.referenceCode || "—"}</strong></div>
                <div><span style={{ color: "var(--text-2)" }}>STK: </span><strong>{tx.bankAccount || "—"}</strong></div>
              </div>

              {tx.reason && (
                <div style={{ padding: "8px 12px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, fontSize: 12.5, color: "#d97706", marginBottom: 12 }}>
                  ⚠️ {tx.reason}
                </div>
              )}

              {filter === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setSelected(tx); setNote(""); }}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 10,
                      border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "#fff", fontWeight: 700, fontSize: 13.5,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => { setSelected(tx); setNote(""); }}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 10,
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444", fontWeight: 700, fontSize: 13.5,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}

              {tx.status !== "pending" && (
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8 }}>
                  {tx.status === "resolved" ? "✅ Đã duyệt" : "❌ Đã từ chối"}
                  {tx.note && ` — ${tx.note}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal duyệt/từ chối */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)", zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-1)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, maxWidth: 480, width: "100%",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, color: "var(--text-0)" }}>
              Xác nhận xử lý
            </h3>
            <div style={{ fontSize: 14, color: "var(--text-1)", marginBottom: 16, lineHeight: 1.6 }}>
              <div>Mã đơn: <strong>{selected.orderCode || "—"}</strong></div>
              <div>Số tiền: <strong style={{ color: "#10b981" }}>{fmt(selected.amount)}</strong></div>
            </div>

            <label style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: "var(--text-0)" }}>
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do duyệt/từ chối..."
              rows={3}
              style={{
                width: "100%", padding: 12, borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--bg-0)",
                color: "var(--text-0)", fontSize: 14, fontFamily: "inherit",
                resize: "vertical", marginBottom: 16, boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleAction("resolve")}
                disabled={submitting}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff", fontWeight: 800, fontSize: 14.5,
                  cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Đang xử lý..." : "✅ Duyệt"}
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={submitting}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444", fontWeight: 800, fontSize: 14.5,
                  cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                ❌ Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
