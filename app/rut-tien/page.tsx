"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: string;
  createdAt: string;
}

const BANKS = [
  { id: "TPBank", name: "TPBank - Tiên Phong" },
  { id: "VCB", name: "Vietcombank" },
  { id: "TCB", name: "Techcombank" },
  { id: "MB", name: "MB Bank" },
  { id: "ACB", name: "ACB" },
  { id: "VPB", name: "VPBank" },
  { id: "VIB", name: "VIB" },
  { id: "BIDV", name: "BIDV" },
  { id: "VTB", name: "Vietinbank" },
  { id: "AGB", name: "Agribank" },
  { id: "SHB", name: "SHB" },
  { id: "OCB", name: "OCB" },
  { id: "MSB", name: "MSB" },
  { id: "EIB", name: "Eximbank" },
];

export default function RutTienPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [list, setList] = useState<Withdrawal[]>([]);

  const loadData = () => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBalance(d.user.balance || 0);
          setAccountName((d.user.name || d.user.username || "").toUpperCase());
        }
      })
      .catch(() => {});

    fetch("/api/withdrawals/list", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setList(d.list || []); })
      .catch(() => {});
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) { router.push("/dang-nhap"); return; }
    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amt = Number(amount.replace(/\D/g, ""));
    if (!amt || amt < 50000) { setError("Số tiền rút tối thiểu 50.000đ"); return; }
    if (amt > balance) { setError(`Số dư không đủ. Hiện có: ${balance.toLocaleString("vi-VN")}đ`); return; }
    if (!bankName || !bankAccount || !accountName) { setError("Vui lòng nhập đầy đủ thông tin ngân hàng"); return; }

    if (!confirm(`Xác nhận rút ${amt.toLocaleString("vi-VN")}đ về ${bankName} - ${bankAccount}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amt, bankName, bankAccount, accountName }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setAmount("");
        loadData();
      } else {
        setError(data.message || "Lỗi");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: "⏳ Chờ duyệt",
    approved: "✅ Đã duyệt",
    completed: "✓ Đã chuyển",
    rejected: "❌ Từ chối",
  };

  return (
    <main style={{ minHeight: "100vh", padding: "100px 20px 80px", background: "var(--bg-0)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
          💸 Rút Tiền
        </h1>
        <p style={{ color: "var(--text-2)", textAlign: "center", marginBottom: 24 }}>
          Rút tiền về ngân hàng — Admin xử lý trong 1-24h
        </p>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", padding: "16px 32px", background: "var(--bg-1)", border: "1.5px solid rgba(167,139,250,0.2)", borderRadius: 16 }}>
            <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
              Số dư hiện tại
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {balance.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: 14, marginBottom: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", fontWeight: 600, fontSize: 14 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: 14, marginBottom: 16, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, color: "#10b981", fontWeight: 600, fontSize: 14 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Số tiền rút <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={amount ? Number(amount.replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="50.000"
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>
              Tối thiểu 50.000đ
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Ngân hàng <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Số tài khoản <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
              placeholder="1234567890"
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "var(--text-0)", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Tên chủ tài khoản <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              placeholder="NGUYEN VAN A"
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "var(--text-0)", outline: "none", textTransform: "uppercase", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #a78bfa, #ec4899)", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 14px 40px rgba(167,139,250,0.4)" }}
          >
            {loading ? "Đang gửi..." : "💸 Gửi yêu cầu rút tiền"}
          </button>
        </form>

        {list.length > 0 && (
          <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>📋 Yêu cầu gần đây</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map((w) => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--bg-2)", borderRadius: 12, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>
                      -{w.amount.toLocaleString("vi-VN")}đ
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                      {w.bankName} - {w.bankAccount}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                      {new Date(w.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 8, background: w.status === "completed" ? "rgba(16,185,129,0.15)" : w.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.15)", color: w.status === "completed" ? "#10b981" : w.status === "rejected" ? "#ef4444" : "#fbbf24", whiteSpace: "nowrap" }}>
                    {statusLabels[w.status] || w.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
