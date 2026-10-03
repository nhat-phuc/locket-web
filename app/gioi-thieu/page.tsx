"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Referral {
  id: string;
  commission: number;
  commissionPaid: boolean;
  code: string;
  createdAt: string;
  paidAt: string | null;
  referred: {
    name: string | null;
    email: string;
    picture: string | null;
  };
}

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  referralCode: string | null;
  commission: number;
  totalReferrals: number;
  balance: number;
  bonusBalance?: number;
  codeChangedAt: string | null;
}

export default function ReferralPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [newCode, setNewCode] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/referral/my", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([me, refs]) => {
        if (me.success) setUser(me.user);
        if (refs.success) setReferrals(refs.referrals || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getLink = () => {
    if (!user?.referralCode) return "";
    const base = process.env.NEXT_PUBLIC_APP_URL || 
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/dang-ky?ref=${user.referralCode}`;
  };

  const copyCode = async () => {
    if (!user?.referralCode) return;
    await navigator.clipboard.writeText(user.referralCode);
    setCopied("code");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = async () => {
    const link = getLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getLink())}`, "_blank");
  };

  const shareZalo = () => {
    window.open(`https://zalo.me/share?u=${encodeURIComponent(getLink())}`, "_blank");
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getLink())}&text=${encodeURIComponent("Tham gia Locket Gold ngay!")}`, "_blank");
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
        setUser({ ...user!, referralCode: data.code, codeChangedAt: new Date().toISOString() });
        setNewCode("");
        setChangeMsg("✅ Đổi mã thành công!");
      } else {
        setChangeMsg("⚠️ " + data.message);
      }
    } catch {
      setChangeMsg("⚠️ Lỗi kết nối");
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <main className="rf-page">
        <div className="rf-loading">
          <div className="rf-spinner" />
          Đang tải...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="rf-page">
        <div className="rf-container">
          <div className="rf-login-required">
            <div className="rf-login-icon">🔒</div>
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem mã giới thiệu</p>
            <Link href="/dang-nhap" className="rf-btn rf-btn-primary">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalCommission = user.commission || 0;
  const paidCount = referrals.filter((r) => r.commissionPaid).length;
  const pendingCount = referrals.length - paidCount;

  return (
    <main className="rf-page">
      {/* Floating decorations */}
      <div className="rf-deco rf-deco-1">🎁</div>
      <div className="rf-deco rf-deco-2">💰</div>
      <div className="rf-deco rf-deco-3">🎉</div>
      <div className="rf-orb rf-orb-1" />
      <div className="rf-orb rf-orb-2" />

      <div className="rf-container">
        {/* HERO */}
        <div className="rf-hero">
          <div className="rf-hero-badge">
            <span className="rf-hero-badge-dot" />
            GIỚI THIỆU BẠN BÈ
          </div>
          <h1 className="rf-hero-title">
            Nhận <span className="rf-hero-highlight">10% hoa hồng</span>
            <br />
            từ mỗi người bạn mời
          </h1>
          <p className="rf-hero-sub">
            Chia sẻ link của bạn. Mỗi người đăng ký và mua gói thành công,
            bạn nhận ngay <strong>10%</strong> giá trị đơn hàng.
          </p>
        </div>

        {/* STATS */}
        <div className="rf-stats">
          <div className="rf-stat rf-stat-blue">
            <div className="rf-stat-emoji">👥</div>
            <div className="rf-stat-info">
              <div className="rf-stat-label">Đã mời</div>
              <div className="rf-stat-value">{referrals.length}</div>
            </div>
          </div>
          <div className="rf-stat rf-stat-green">
            <div className="rf-stat-emoji">💰</div>
            <div className="rf-stat-info">
              <div className="rf-stat-label">Hoa hồng</div>
              <div className="rf-stat-value">{totalCommission.toLocaleString("vi-VN")}đ</div>
            </div>
          </div>
          <div className="rf-stat rf-stat-orange">
            <div className="rf-stat-emoji">⏳</div>
            <div className="rf-stat-info">
              <div className="rf-stat-label">Chờ</div>
              <div className="rf-stat-value">{pendingCount}</div>
            </div>
          </div>
        </div>

        {/* CODE CARD */}
        <div className="rf-code-card">
          <div className="rf-code-card-glow" />
          <div className="rf-code-header">
            <span className="rf-code-icon">🎫</span>
            <span className="rf-code-title">Mã giới thiệu của bạn</span>
            <button className="rf-code-refresh" onClick={copyCode} title="Chép mã">
              {copied === "code" ? "✅" : "📋"}
            </button>
          </div>

          <div className="rf-code-value" onClick={copyCode}>
            <span className="rf-code-text">{user.referralCode || "ĐANG CẬP NHẬT"}</span>
            <span className="rf-code-copy">{copied === "code" ? "Đã chép" : "Chép"}</span>
          </div>

          {/* Link preview */}
          <div className="rf-link-box">
            <span className="rf-link-label">🔗 Link mời</span>
            <div className="rf-link-value">{getLink()}</div>
          </div>

          {/* Share buttons */}
          <div className="rf-share-grid">
            <button onClick={copyLink} className="rf-share-btn rf-share-copy">
              {copied === "link" ? "✅ Đã chép" : "📋 Chép link"}
            </button>
            <button onClick={shareFacebook} className="rf-share-btn rf-share-fb">
              📘 Facebook
            </button>
            <button onClick={shareZalo} className="rf-share-btn rf-share-zalo">
              💬 Zalo
            </button>
            <button onClick={shareTelegram} className="rf-share-btn rf-share-tg">
              ✈️ Telegram
            </button>
          </div>

          {/* Đổi mã */}
          {!user.codeChangedAt && (
            <div className="rf-change-code">
              <div className="rf-change-code-label">
                ✏️ Đổi mã giới thiệu (chỉ 1 lần)
              </div>
              <div className="rf-change-code-row">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="PHUC2026"
                  maxLength={12}
                  className="rf-change-code-input"
                />
                <button
                  onClick={handleChangeCode}
                  disabled={changing || newCode.length < 4}
                  className="rf-change-code-btn"
                >
                  {changing ? "..." : "Đổi"}
                </button>
              </div>
              <div className="rf-change-code-hint">4-12 ký tự, chỉ A-Z và 0-9</div>
              {changeMsg && <div className="rf-change-code-msg">{changeMsg}</div>}
            </div>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div className="rf-howto">
          <h2 className="rf-section-title">
            <span className="rf-section-emoji">🎯</span>
            Cách nhận hoa hồng
          </h2>
          <div className="rf-steps">
            <div className="rf-step">
              <div className="rf-step-num">1</div>
              <div className="rf-step-content">
                <div className="rf-step-title">Chia sẻ link</div>
                <div className="rf-step-desc">Gửi link cho bạn bè qua Facebook, Zalo...</div>
              </div>
            </div>
            <div className="rf-step">
              <div className="rf-step-num">2</div>
              <div className="rf-step-content">
                <div className="rf-step-title">Bạn bè đăng ký</div>
                <div className="rf-step-desc">Họ tạo tài khoản qua link của bạn</div>
              </div>
            </div>
            <div className="rf-step">
              <div className="rf-step-num">3</div>
              <div className="rf-step-content">
                <div className="rf-step-title">Họ mua gói</div>
                <div className="rf-step-desc">Khi họ thanh toán bất kỳ gói nào</div>
              </div>
            </div>
            <div className="rf-step">
              <div className="rf-step-num rf-step-num-green">4</div>
              <div className="rf-step-content">
                <div className="rf-step-title">Bạn nhận 10% 🎉</div>
                <div className="rf-step-desc">Tiền cộng vào ví ngay lập tức</div>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        <div className="rf-history">
          <h2 className="rf-section-title">
            <span className="rf-section-emoji">📋</span>
            Lịch sử giới thiệu ({referrals.length})
          </h2>

          {referrals.length === 0 ? (
            <div className="rf-empty">
              <div className="rf-empty-icon">🎁</div>
              <p>Chưa có ai đăng ký qua mã của bạn</p>
              <span>Chia sẻ link ngay để nhận hoa hồng!</span>
            </div>
          ) : (
            <div className="rf-list">
              {referrals.map((r) => (
                <div key={r.id} className="rf-row">
                  <div className="rf-row-avatar">
                    {r.referred.picture ? (
                      <img src={r.referred.picture} alt="" />
                    ) : (
                      <div className="rf-row-avatar-fallback">
                        {(r.referred.name || r.referred.email)[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="rf-row-info">
                    <div className="rf-row-name">
                      {r.referred.name || r.referred.email.split("@")[0]}
                    </div>
                    <div className="rf-row-date">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className={`rf-row-status ${r.commissionPaid ? "is-paid" : "is-pending"}`}>
                    {r.commissionPaid ? (
                      <>
                        <span className="rf-row-check">✓</span>
                        +{r.commission.toLocaleString("vi-VN")}đ
                      </>
                    ) : (
                      <>
                        <span className="rf-row-clock">⏳</span>
                        Chờ mua gói
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .rf-page {
          position: relative;
          min-height: 100vh;
          padding: 32px 20px 120px;
          background: linear-gradient(180deg, #faf5ff 0%, #fdf2f8 50%, #f5f3ff 100%);
          overflow: hidden;
        }
        .rf-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          pointer-events: none;
        }
        .rf-orb-1 {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, #a78bfa, transparent 70%);
        }
        .rf-orb-2 {
          width: 400px; height: 400px;
          bottom: 20%; right: -150px;
          background: radial-gradient(circle, #ec4899, transparent 70%);
        }
        .rf-deco {
          position: absolute;
          font-size: 28px;
          opacity: 0.5;
          pointer-events: none;
          animation: rfFloat 4s ease-in-out infinite;
        }
        .rf-deco-1 { top: 15%; left: 8%; animation-delay: 0s; }
        .rf-deco-2 { top: 30%; right: 10%; animation-delay: 1s; }
        .rf-deco-3 { top: 55%; left: 5%; animation-delay: 2s; }
        @keyframes rfFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        .rf-container {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
          z-index: 1;
        }
        .rf-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 80px;
          color: #6b7280;
        }
        .rf-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(167,139,250,0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: rfSpin 0.8s linear infinite;
        }
        @keyframes rfSpin { to { transform: rotate(360deg); } }

        .rf-login-required {
          text-align: center;
          padding: 60px 24px;
          border-radius: 24px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167,139,250,0.2);
        }
        .rf-login-icon { font-size: 48px; margin-bottom: 12px; }
        .rf-login-required h2 { font-size: 20px; font-weight: 800; color: #111; margin: 0 0 8px; }
        .rf-login-required p { font-size: 13px; color: #6b7280; margin: 0 0 20px; }

        /* HERO */
        .rf-hero { text-align: center; margin-bottom: 28px; }
        .rf-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167,139,250,0.3);
          color: #a78bfa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          margin-bottom: 14px;
          box-shadow: 0 4px 16px rgba(167,139,250,0.15);
        }
        .rf-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.25);
          animation: rfPulse 1.5s infinite;
        }
        @keyframes rfPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .rf-hero-title {
          font-size: 32px;
          font-weight: 900;
          color: #111;
          margin: 0 0 10px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
        .rf-hero-highlight {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .rf-hero-sub {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.55;
          max-width: 480px;
          margin: 0 auto;
        }
        .rf-hero-sub strong {
          color: #a78bfa;
          font-weight: 800;
        }

        /* STATS */
        .rf-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .rf-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167,139,250,0.15);
          box-shadow: 0 4px 20px rgba(167,139,250,0.08);
        }
        .rf-stat-blue { border-color: rgba(59,130,246,0.2); }
        .rf-stat-green { border-color: rgba(34,197,94,0.25); }
        .rf-stat-orange { border-color: rgba(245,158,11,0.25); }
        .rf-stat-emoji { font-size: 22px; flex-shrink: 0; }
        .rf-stat-info { min-width: 0; flex: 1; }
        .rf-stat-label {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rf-stat-value {
          font-size: 16px;
          font-weight: 900;
          color: #111;
          margin-top: 2px;
          line-height: 1.1;
        }
        .rf-stat-green .rf-stat-value { color: #22c55e; }
        .rf-stat-orange .rf-stat-value { color: #f59e0b; }

        /* CODE CARD */
        .rf-code-card {
          position: relative;
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(135deg, #ffffff, #faf5ff);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(167,139,250,0.25);
          box-shadow: 0 12px 40px rgba(167,139,250,0.18);
          margin-bottom: 20px;
          overflow: hidden;
        }
        .rf-code-card-glow {
          position: absolute;
          top: -50%; right: -20%;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.15), transparent 60%);
          pointer-events: none;
        }
        .rf-code-header {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .rf-code-icon { font-size: 18px; }
        .rf-code-title {
          flex: 1;
          font-size: 12px;
          font-weight: 800;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rf-code-refresh {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(167,139,250,0.12);
          border: none;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rf-code-value {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-radius: 16px;
          background: linear-gradient(135deg, #faf5ff, #fdf2f8);
          border: 2px dashed rgba(167,139,250,0.4);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 14px;
        }
        .rf-code-value:hover {
          border-color: #a78bfa;
          background: linear-gradient(135deg, #f5f0ff, #fdf2f8);
        }
        .rf-code-text {
          font-family: ui-monospace, "SF Mono", monospace;
          font-size: 26px;
          font-weight: 900;
          color: #7c3aed;
          letter-spacing: 3px;
        }
        .rf-code-copy {
          font-size: 11px;
          font-weight: 800;
          color: #a78bfa;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(167,139,250,0.15);
        }

        .rf-link-box {
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(167,139,250,0.06);
          border: 1px solid rgba(167,139,250,0.15);
          margin-bottom: 14px;
        }
        .rf-link-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .rf-link-value {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          color: #7c3aed;
          word-break: break-all;
          font-weight: 600;
        }

        /* SHARE GRID */
        .rf-share-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .rf-share-btn {
          padding: 12px 8px;
          border-radius: 12px;
          border: none;
          font-size: 12px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rf-share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .rf-share-copy {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          box-shadow: 0 6px 18px rgba(124,58,237,0.3);
        }
        .rf-share-fb { background: #1877f2; color: #fff; }
        .rf-share-zalo { background: #0068ff; color: #fff; }
        .rf-share-tg { background: #229ed9; color: #fff; }

        /* CHANGE CODE */
        .rf-change-code {
          padding: 14px;
          border-radius: 14px;
          background: rgba(245,158,11,0.06);
          border: 1.5px dashed rgba(245,158,11,0.3);
        }
        .rf-change-code-label {
          font-size: 12px;
          font-weight: 800;
          color: #111;
          margin-bottom: 8px;
        }
        .rf-change-code-row {
          display: flex;
          gap: 8px;
        }
        .rf-change-code-input {
          flex: 1;
          padding: 11px 14px;
          border-radius: 10px;
          background: #fff;
          border: 1.5px solid rgba(245,158,11,0.3);
          color: #111;
          font-family: ui-monospace, monospace;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 2px;
          outline: none;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .rf-change-code-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
        }
        .rf-change-code-btn {
          padding: 11px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }
        .rf-change-code-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .rf-change-code-hint {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 6px;
        }
        .rf-change-code-msg {
          font-size: 12px;
          font-weight: 700;
          margin-top: 8px;
        }

        /* HOWTO */
        .rf-howto, .rf-history {
          padding: 22px;
          border-radius: 22px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167,139,250,0.15);
          box-shadow: 0 4px 20px rgba(167,139,250,0.08);
          margin-bottom: 20px;
        }
        .rf-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 900;
          color: #111;
          margin: 0 0 16px;
        }
        .rf-section-emoji { font-size: 18px; }

        .rf-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rf-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(167,139,250,0.04), rgba(236,72,153,0.02));
          border: 1px solid rgba(167,139,250,0.1);
        }
        .rf-step-num {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-weight: 900;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124,58,237,0.25);
        }
        .rf-step-num-green {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 4px 12px rgba(34,197,94,0.3);
        }
        .rf-step-content { flex: 1; min-width: 0; }
        .rf-step-title {
          font-size: 13px;
          font-weight: 800;
          color: #111;
        }
        .rf-step-desc {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        /* HISTORY */
        .rf-empty {
          text-align: center;
          padding: 32px 16px;
          color: #6b7280;
        }
        .rf-empty-icon { font-size: 48px; margin-bottom: 8px; opacity: 0.5; }
        .rf-empty p { font-size: 14px; font-weight: 700; color: #374151; margin: 0 0 4px; }
        .rf-empty span { font-size: 12px; }

        .rf-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rf-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(167,139,250,0.04), rgba(236,72,153,0.02));
          border: 1px solid rgba(167,139,250,0.1);
        }
        .rf-row-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(167,139,250,0.4);
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rf-row-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rf-row-avatar-fallback { color: #fff; font-weight: 800; font-size: 16px; }
        .rf-row-info { flex: 1; min-width: 0; }
        .rf-row-name {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rf-row-date {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .rf-row-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .rf-row-status.is-paid { color: #22c55e; }
        .rf-row-status.is-pending {
          color: #f59e0b;
          font-size: 11px;
          font-weight: 700;
        }
        .rf-row-check {
          display: inline-flex;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: rgba(34,197,94,0.15);
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }
        .rf-row-clock { font-size: 12px; }

        /* BUTTON */
        .rf-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s;
        }
        .rf-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }
        .rf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.45);
        }

        @media (max-width: 640px) {
          .rf-page { padding: 20px 14px 100px; }
          .rf-hero-title { font-size: 24px; }
          .rf-hero-sub { font-size: 13px; }
          .rf-stats { gap: 6px; }
          .rf-stat { padding: 10px; gap: 8px; }
          .rf-stat-emoji { font-size: 18px; }
          .rf-stat-value { font-size: 13px; }
          .rf-code-card { padding: 16px; border-radius: 20px; }
          .rf-code-text { font-size: 20px; letter-spacing: 2px; }
          .rf-share-grid { grid-template-columns: repeat(2, 1fr); }
          .rf-deco { display: none; }
        }
      `}</style>
    </main>
  );
}
