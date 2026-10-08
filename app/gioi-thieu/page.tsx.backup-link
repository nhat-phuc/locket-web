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
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#f472b6" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💖</div>
        Đang tải...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#f472b6" }}>
        Không tải được dữ liệu
      </div>
    );
  }

  return (
    <div className="tai-khoan-page">
      {/* HERO PINK */}
      <div
        style={{
          background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
          borderRadius: 24,
          padding: "40px 24px 32px",
          textAlign: "center",
          marginBottom: 24,
          border: "1px solid #fbcfe8",
          boxShadow: "0 8px 32px rgba(244, 114, 182, 0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative hearts */}
        <div style={{ position: "absolute", top: 16, left: 20, fontSize: 24, opacity: 0.4 }}>💕</div>
        <div style={{ position: "absolute", top: 40, right: 28, fontSize: 20, opacity: 0.3 }}>💗</div>
        <div style={{ position: "absolute", bottom: 20, left: 40, fontSize: 18, opacity: 0.3 }}>💖</div>
        <div style={{ position: "absolute", bottom: 30, right: 50, fontSize: 22, opacity: 0.4 }}>💝</div>

        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ec4899, #f472b6)",
            display: "grid",
            placeItems: "center",
            fontSize: 44,
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(236, 72, 153, 0.35)",
            position: "relative",
            zIndex: 1,
          }}
        >
          🎁
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#831843",
            marginBottom: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          Giới thiệu bạn bè
        </h1>
        <p
          style={{
            color: "#9d174d",
            fontSize: 14,
            margin: 0,
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
          }}
        >
          Mời bạn bè đăng ký và mua gói
        </p>
        <div
          style={{
            display: "inline-block",
            marginTop: 16,
            padding: "8px 20px",
            background: "#fff",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 900,
            color: "#ec4899",
            boxShadow: "0 4px 12px rgba(236, 72, 153, 0.2)",
            position: "relative",
            zIndex: 1,
          }}
        >
          💰 Nhận ngay 30.000đ / người
        </div>
      </div>

      {/* STATS — 3 card pink */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCardPink
          label="Đã mời"
          value={stats.totalReferrals}
          icon="👥"
          color="#3b82f6"
          bg="#eff6ff"
          border="#bfdbfe"
        />
        <StatCardPink
          label="Hoa hồng"
          value={fmt(stats.totalCommission)}
          icon="💵"
          color="#10b981"
          bg="#ecfdf5"
          border="#a7f3d0"
        />
        <StatCardPink
          label="Chờ"
          value={fmt(stats.pendingCommission)}
          icon="⏳"
          color="#f59e0b"
          bg="#fffbeb"
          border="#fde68a"
        />
      </div>

      {/* MÃ GT — card pink */}
      <PinkCard>
        <PinkHeader icon="🔑" title="Mã giới thiệu của bạn" />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: 200,
              background: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
              border: "2px dashed #ec4899",
              borderRadius: 14,
              padding: "18px 20px",
              fontFamily: "monospace",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#be185d",
              textAlign: "center",
            }}
          >
            {stats.referralCode || "ĐANG CẬP NHẬT"}
          </div>
          <button
            onClick={() => copy(stats.referralCode, "code")}
            disabled={!stats.referralCode}
            style={{
              padding: "16px 28px",
              background: "linear-gradient(135deg, #ec4899, #f472b6)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              opacity: stats.referralCode ? 1 : 0.5,
              boxShadow: "0 6px 16px rgba(236, 72, 153, 0.3)",
            }}
          >
            {copied === "code" ? "✅ Đã copy" : "📋 Copy mã"}
          </button>
        </div>
      </PinkCard>

      {/* LINK MỜI */}
      <PinkCard>
        <PinkHeader icon="🔗" title="Link mời bạn bè" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            readOnly
            value={link}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "14px 18px",
              background: "#fdf2f8",
              border: "1px solid #fbcfe8",
              borderRadius: 14,
              color: "#831843",
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          />
          <button
            onClick={() => copy(link, "link")}
            disabled={!link}
            style={{
              padding: "14px 24px",
              background: "#fff",
              color: "#ec4899",
              border: "2px solid #fbcfe8",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              opacity: link ? 1 : 0.5,
            }}
          >
            {copied === "link" ? "✅ Đã copy" : "📋 Copy link"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#9d174d", marginTop: 10, lineHeight: 1.6 }}>
          💡 Chia sẻ link này cho bạn bè. Khi họ đăng ký và mua gói đầu tiên, bạn nhận ngay{" "}
          <b style={{ color: "#ec4899" }}>30.000đ</b> vào số dư.
        </div>
      </PinkCard>

      {/* ĐỔI MÃ */}
      {!codeChanged && (
        <PinkCard>
          <PinkHeader icon="✏️" title="Đổi mã giới thiệu (1 lần)" />
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
                padding: "14px 18px",
                background: "#fdf2f8",
                border: "1px solid #fbcfe8",
                borderRadius: 14,
                color: "#831843",
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            />
            <button
              onClick={handleChangeCode}
              disabled={changing || newCode.length < 4}
              style={{
                padding: "14px 28px",
                background:
                  changing || newCode.length < 4
                    ? "#fbcfe8"
                    : "linear-gradient(135deg, #ec4899, #f472b6)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: changing || newCode.length < 4 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                boxShadow: changing || newCode.length < 4 ? "none" : "0 6px 16px rgba(236, 72, 153, 0.3)",
              }}
            >
              {changing ? "..." : "Đổi"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#9d174d", marginTop: 10 }}>
            4-12 ký tự, chỉ A-Z và 0-9. Chỉ đổi được 1 lần.
          </div>
          {changeMsg && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: changeMsg.startsWith("✅") ? "#ecfdf5" : "#fef2f2",
                color: changeMsg.startsWith("✅") ? "#059669" : "#dc2626",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {changeMsg}
            </div>
          )}
        </PinkCard>
      )}

      {/* DANH SÁCH ĐÃ MỜI */}
      <PinkCard>
        <PinkHeader icon="👥" title={`Người đã mời (${stats.referrals.length})`} />
        {stats.referrals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#9d174d",
              fontSize: 14,
              background: "#fdf2f8",
              borderRadius: 14,
              border: "1px dashed #fbcfe8",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>💝</div>
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
                  background: "linear-gradient(135deg, #fff, #fdf2f8)",
                  border: "1px solid #fce7f3",
                  borderRadius: 14,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt=""
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        border: "2px solid #fbcfe8",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ec4899, #f472b6)",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {(r.username || r.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#831843",
                      }}
                    >
                      @{r.username || r.name || "user"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9d174d", fontWeight: 600 }}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 15,
                      color: r.commissionPaid ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {r.commissionPaid ? "+" + fmt(r.commission) : "Chờ mua gói"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9d174d", fontWeight: 600 }}>
                    {r.commissionPaid ? "✅ Đã nhận" : "⏳ Chưa phát sinh"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PinkCard>
    </div>
  );
}

function PinkCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #fce7f3",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 4px 20px rgba(244, 114, 182, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

function PinkHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "2px solid #fce7f3",
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <h2 style={{ fontSize: 17, fontWeight: 900, color: "#831843", margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

function StatCardPink({
  label,
  value,
  icon,
  color,
  bg,
  border,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: 18,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          marginBottom: 6,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
