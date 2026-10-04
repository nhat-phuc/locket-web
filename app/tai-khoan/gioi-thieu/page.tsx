"use client";

import { useEffect, useState } from "react";

interface ReferralItem {
  id: string;
  username: string;
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
}

interface Stats {
  referralCode: string;
  totalReferrals: number;
  totalCommission: number;
  referrals: ReferralItem[];
}

export default function GioiThieuPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referral/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const link = stats?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/dang-ky?ref=${stats.referralCode}`
    : "";

  const copy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>;
  }

  if (!stats) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Không tải được dữ liệu</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--text-0)" }}>
          🎁 Giới thiệu bạn bè
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>
          Mời bạn bè đăng ký và mua gói — bạn nhận ngay <b style={{ color: "#10b981" }}>10.000đ</b> cho mỗi người
        </p>
      </div>

      {/* Thống kê */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
            Đã mời
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#60a5fa" }}>
            {stats.totalReferrals}
          </div>
        </div>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
            Hoa hồng
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#10b981" }}>
            {fmt(stats.totalCommission)}
          </div>
        </div>
      </div>

      {/* Mã giới thiệu */}
      <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,.08), rgba(167,139,250,.04))", border: "1px solid rgba(167,139,250,.3)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
          Mã giới thiệu của bạn
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            flex: 1,
            minWidth: 200,
            background: "var(--bg-0)",
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
            {stats.referralCode}
          </div>
          <button
            onClick={() => copy(stats.referralCode, "code")}
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
            }}
          >
            {copied === "code" ? "✅ Đã copy" : "📋 Copy mã"}
          </button>
        </div>
      </div>

      {/* Link mời */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-2)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
          Link mời bạn bè
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            readOnly
            value={link}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "12px 16px",
              background: "var(--bg-0)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-1)",
              fontSize: 13,
              fontFamily: "monospace",
            }}
          />
          <button
            onClick={() => copy(link, "link")}
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
            }}
          >
            {copied === "link" ? "✅ Đã copy" : "📋 Copy link"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 10, lineHeight: 1.6 }}>
          💡 Chia sẻ link này cho bạn bè. Khi họ đăng ký và mua gói đầu tiên, bạn nhận ngay 10.000đ vào ví.
        </div>
      </div>

      {/* Danh sách người đã mời */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--text-0)" }}>
          Người đã mời ({stats.referrals.length})
        </h2>
        {stats.referrals.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 14, border: "1px solid var(--border)" }}>
            Chưa có ai. Hãy chia sẻ link để bắt đầu kiếm hoa hồng! 🎉
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {stats.referrals.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "var(--bg-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>
                    {r.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>@{r.username}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)" }}>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
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
