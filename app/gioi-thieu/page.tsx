"use client";

import { useEffect, useState } from "react";

interface ReferralItem {
  id: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
  paidAt: string | null;
}

interface Stats {
  referralCode: string;
  balance: number;
  bonusBalance: number;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  referrals: ReferralItem[];
}

export default function GioiThieuPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState("");
  const [codeChanged, setCodeChanged] = useState(false);

  const load = () => {
    fetch("/api/referral/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const link = stats?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/dang-ky?ref=${stats.referralCode}`
    : "";

  const copy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleChangeCode = async () => {
    if (!newCode.trim()) return;
    setChanging(true);
    setChangeMsg("");
    try {
      const res = await fetch("/api/referral/change-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode }),
      });
      const data = await res.json();
      if (data.success) {
        setChangeMsg("✅ Đổi mã thành công!");
        setCodeChanged(true);
        setNewCode("");
        load();
      } else {
        setChangeMsg("⚠️ " + (data.message || "Lỗi"));
      }
    } catch {
      setChangeMsg("⚠️ Lỗi kết nối");
    } finally {
      setChanging(false);
    }
  };

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  if (loading) {
    return <div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>Đang tải...</div>;
  }

  if (!stats) {
    return <div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>Không tải được dữ liệu</div>;
  }

  return (
    <div className="tai-khoan-page">
      {/* Hero */}
      <div className="tk-hero">
        <div className="tk-avatar-wrapper" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
          <div className="tk-avatar-fallback" style={{ fontSize: 42 }}>🎁</div>
        </div>
        <h1 className="tk-title">Giới thiệu bạn bè</h1>
        <div className="tk-badge">NHẬN 30.000Đ / NGƯỜI</div>
      </div>

      {/* Stats — 3 card */}
      <div className="tk-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <div className="tk-label" style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>
              Đã mời
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa" }}>{stats.totalReferrals}</div>
          </div>
          <div>
            <div className="tk-label" style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>
              Hoa hồng
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#10b981" }}>{fmt(stats.totalCommission)}</div>
          </div>
          <div>
            <div className="tk-label" style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>
              Chờ
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fbbf24" }}>{fmt(stats.pendingCommission)}</div>
          </div>
        </div>
      </div>

      {/* Mã GT */}
      <div className="tk-card">
        <div className="tk-card-header">
          <span style={{ fontSize: 22 }}>🔑</span>
          <h2>Mã giới thiệu của bạn</h2>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            flex: 1,
            minWidth: 200,
            background: "var(--bg-2)",
            border: "2px dashed #a78bfa",
            borderRadius: 12,
            padding: "14px 20px",
            fontFamily: "monospace",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#a78bfa",
            textAlign: "center",
          }}>
            {stats.referralCode || "ĐANG CẬP NHẬT"}
          </div>
          <button
            onClick={() => copy(stats.referralCode, "code")}
            disabled={!stats.referralCode}
            style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              opacity: stats.referralCode ? 1 : 0.5,
            }}
          >
            {copied === "code" ? "✅ Đã copy" : "📋 Copy mã"}
          </button>
        </div>
      </div>

      {/* Link mời */}
      <div className="tk-card">
        <div className="tk-card-header">
          <span style={{ fontSize: 22 }}>🔗</span>
          <h2>Link mời bạn bè</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            readOnly
            value={link}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "12px 16px",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-1)",
              fontSize: 13,
              fontFamily: "monospace",
            }}
          />
          <button
            onClick={() => copy(link, "link")}
            disabled={!link}
            style={{
              padding: "12px 24px",
              background: "var(--bg-2)",
              color: "var(--text-0)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              opacity: link ? 1 : 0.5,
            }}
          >
            {copied === "link" ? "✅ Đã copy" : "📋 Copy link"}
          </button>
        </div>
      </div>

      {/* Đổi mã */}
      {!codeChanged && (
        <div className="tk-card">
          <div className="tk-card-header">
            <span style={{ fontSize: 22 }}>✏️</span>
            <h2>Đổi mã giới thiệu (1 lần)</h2>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="PHUC2026"
              maxLength={12}
              style={{
                flex: 1,
                minWidth: 200,
                padding: "12px 16px",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text-0)",
                fontSize: 14,
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={handleChangeCode}
              disabled={changing || newCode.length < 4}
              style={{
                padding: "12px 24px",
                background: changing || newCode.length < 4 ? "var(--bg-2)" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: changing || newCode.length < 4 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {changing ? "..." : "Đổi"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 10 }}>
            4-12 ký tự, chỉ A-Z và 0-9. Chỉ đổi được 1 lần.
          </div>
          {changeMsg && (
            <div style={{ marginTop: 10, fontSize: 13, color: changeMsg.startsWith("✅") ? "#10b981" : "#f87171" }}>
              {changeMsg}
            </div>
          )}
        </div>
      )}

      {/* Danh sách đã mời */}
      <div className="tk-card">
        <div className="tk-card-header">
          <span style={{ fontSize: 22 }}>👥</span>
          <h2>Người đã mời ({stats.referrals.length})</h2>
        </div>
        {stats.referrals.length === 0 ? (
          <div className="tk-empty" style={{ textAlign: "center", padding: 30, color: "var(--text-2)", fontSize: 14 }}>
            Chưa có ai. Hãy chia sẻ link để bắt đầu kiếm hoa hồng! 🎉
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {stats.referrals.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {r.avatar ? (
                    <img src={r.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                      display: "grid", placeItems: "center",
                      color: "#fff", fontWeight: 800,
                    }}>
                      {(r.username || r.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>
                      @{r.username || r.name || "user"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-2)" }}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: r.commissionPaid ? "#10b981" : "#fbbf24" }}>
                    {r.commissionPaid ? "+" + fmt(r.commission) : "Chờ mua gói"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-2)" }}>
                    {r.commissionPaid ? "Đã nhận" : "Chưa phát sinh"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
