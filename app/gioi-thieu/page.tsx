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
}

export default function ReferralPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

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
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
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
    const url = encodeURIComponent(getLink());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  if (loading) {
    return (
      <main className="ref-page">
        <div className="ref-loading">
          <div className="ref-spinner" />
          Đang tải...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="ref-page">
        <div className="ref-container">
          <div className="ref-not-logged">
            <div className="ref-not-logged-icon">🔒</div>
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem mã giới thiệu</p>
            <Link href="/dang-nhap" className="ref-btn ref-btn-primary">
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
    <main className="ref-page">
      <div className="ref-orb ref-orb-1" />
      <div className="ref-orb ref-orb-2" />

      <div className="ref-container">
        {/* Header */}
        <div className="ref-header">
          <div className="ref-header-badge">
            <span>🎁</span> GIỚI THIỆU BẠN BÈ
          </div>
          <h1 className="ref-title">
            Nhận <span className="ref-title-gradient">10% hoa hồng</span>
          </h1>
          <p className="ref-subtitle">
            Mỗi người bạn giới thiệu mua gói, bạn nhận ngay 10% giá trị đơn hàng
          </p>
        </div>

        {/* Stats */}
        <div className="ref-stats">
          <div className="ref-stat">
            <div className="ref-stat-icon">👥</div>
            <div className="ref-stat-label">Đã mời</div>
            <div className="ref-stat-value">{referrals.length}</div>
          </div>
          <div className="ref-stat">
            <div className="ref-stat-icon">💰</div>
            <div className="ref-stat-label">Hoa hồng</div>
            <div className="ref-stat-value ref-stat-green">
              {totalCommission.toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div className="ref-stat">
            <div className="ref-stat-icon">⏳</div>
            <div className="ref-stat-label">Chờ</div>
            <div className="ref-stat-value ref-stat-orange">{pendingCount}</div>
          </div>
        </div>

        {/* Code Card */}
        <div className="ref-code-card">
          <div className="ref-code-header">
            <div className="ref-code-label">Mã giới thiệu của bạn</div>
            <div className="ref-code-hint">Chia sẻ cho bạn bè</div>
          </div>

          <div className="ref-code-display" onClick={copyCode}>
            <div className="ref-code-text">{user.referralCode || "ĐANG CẬP NHẬT"}</div>
            <div className="ref-code-copy">
              {copied === "code" ? "✅ Đã chép" : "📋 Chép"}
            </div>
          </div>

          {/* Action buttons */}
          <div className="ref-actions">
            <button onClick={copyLink} className="ref-btn ref-btn-copy">
              {copied === "link" ? "✅ Đã chép link" : "🔗 Chép link mời"}
            </button>
            <button onClick={shareFacebook} className="ref-btn ref-btn-fb">
              📘 Facebook
            </button>
          </div>

          <div className="ref-link-preview">
            <div className="ref-link-preview-label">Link mời của bạn:</div>
            <div className="ref-link-preview-value">{getLink()}</div>
          </div>
        </div>

        {/* How it works */}
        <div className="ref-howto">
          <h2 className="ref-section-title">🎯 Cách nhận hoa hồng</h2>
          <div className="ref-steps">
            <div className="ref-step">
              <div className="ref-step-num">1</div>
              <div className="ref-step-content">
                <div className="ref-step-title">Chia sẻ mã</div>
                <div className="ref-step-desc">Gửi mã hoặc link cho bạn bè</div>
              </div>
            </div>
            <div className="ref-step">
              <div className="ref-step-num">2</div>
              <div className="ref-step-content">
                <div className="ref-step-title">Bạn bè đăng ký</div>
                <div className="ref-step-desc">Họ tạo tài khoản với mã của bạn</div>
              </div>
            </div>
            <div className="ref-step">
              <div className="ref-step-num">3</div>
              <div className="ref-step-content">
                <div className="ref-step-title">Họ mua gói</div>
                <div className="ref-step-desc">Khi họ mua bất kỳ gói nào</div>
              </div>
            </div>
            <div className="ref-step">
              <div className="ref-step-num">4</div>
              <div className="ref-step-content">
                <div className="ref-step-title">Bạn nhận 10%</div>
                <div className="ref-step-desc">Tiền cộng vào ví ngay lập tức</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral list */}
        <div className="ref-list-section">
          <h2 className="ref-section-title">
            📋 Lịch sử giới thiệu ({referrals.length})
          </h2>

          {referrals.length === 0 ? (
            <div className="ref-empty">
              <div className="ref-empty-icon">🎁</div>
              <p>Chưa có ai đăng ký qua mã của bạn</p>
              <span>Chia sẻ mã ngay để nhận hoa hồng!</span>
            </div>
          ) : (
            <div className="ref-list">
              {referrals.map((r) => (
                <div key={r.id} className="ref-row">
                  <div className="ref-row-user">
                    <div className="ref-row-avatar">
                      {r.referred.picture ? (
                        <img src={r.referred.picture} alt="" />
                      ) : (
                        <div className="ref-row-avatar-fallback">
                          {(r.referred.name || r.referred.email)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="ref-row-name">
                        {r.referred.name || r.referred.email.split("@")[0]}
                      </div>
                      <div className="ref-row-date">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className={`ref-row-status ${r.commissionPaid ? "is-paid" : "is-pending"}`}>
                    {r.commissionPaid ? (
                      <>
                        <span className="ref-row-icon">✅</span>
                        +{r.commission.toLocaleString("vi-VN")}đ
                      </>
                    ) : (
                      <>
                        <span className="ref-row-icon">⏳</span>
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
        .ref-page {
          position: relative;
          min-height: 100vh;
          padding: 32px 20px 100px;
          background: var(--bg-0);
          overflow: hidden;
        }
        .ref-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          pointer-events: none;
        }
        .ref-orb-1 {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, #7c3aed, transparent 70%);
        }
        .ref-orb-2 {
          width: 400px; height: 400px;
          bottom: -150px; right: -100px;
          background: radial-gradient(circle, #ec4899, transparent 70%);
        }
        .ref-container {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
          z-index: 1;
        }
        .ref-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 80px;
          color: var(--text-2);
        }
        .ref-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(167,139,250,0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: refSpin 0.8s linear infinite;
        }
        @keyframes refSpin { to { transform: rotate(360deg); } }

        .ref-not-logged {
          text-align: center;
          padding: 60px 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167,139,250,0.2);
        }
        .ref-not-logged-icon { font-size: 48px; margin-bottom: 12px; }
        .ref-not-logged h2 { font-size: 20px; font-weight: 800; color: var(--text-0); margin: 0 0 8px; }
        .ref-not-logged p { font-size: 13px; color: var(--text-2); margin: 0 0 20px; }

        /* Header */
        .ref-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .ref-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(236,72,153,0.15));
          border: 1px solid rgba(167,139,250,0.3);
          color: #a78bfa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .ref-title {
          font-size: 30px;
          font-weight: 900;
          color: var(--text-0);
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .ref-title-gradient {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ref-subtitle {
          font-size: 13px;
          color: var(--text-2);
          margin: 0;
          line-height: 1.5;
        }

        /* Stats */
        .ref-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .ref-stat {
          padding: 14px 10px;
          border-radius: 14px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167,139,250,0.2);
          text-align: center;
        }
        .ref-stat-icon { font-size: 20px; margin-bottom: 4px; }
        .ref-stat-label {
          font-size: 10px;
          color: var(--text-2);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ref-stat-value {
          font-size: 18px;
          font-weight: 900;
          color: var(--text-0);
          margin-top: 2px;
        }
        .ref-stat-green { color: #22c55e; }
        .ref-stat-orange { color: #f59e0b; }

        /* Code card */
        .ref-code-card {
          padding: 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.05));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(167,139,250,0.3);
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.12);
        }
        .ref-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .ref-code-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ref-code-hint {
          font-size: 11px;
          color: #a78bfa;
          font-weight: 700;
        }
        .ref-code-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 14px;
          background: #fff;
          border: 1.5px solid rgba(167,139,250,0.2);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }
        .ref-code-display:hover {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
        }
        .ref-code-text {
          flex: 1;
          font-family: ui-monospace, monospace;
          font-size: 20px;
          font-weight: 900;
          color: #7c3aed;
          letter-spacing: 2px;
          text-align: center;
        }
        .ref-code-copy {
          font-size: 12px;
          font-weight: 800;
          color: #a78bfa;
          white-space: nowrap;
        }

        .ref-actions {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        .ref-btn {
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }
        .ref-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }
        .ref-btn-copy {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          box-shadow: 0 6px 20px rgba(124,58,237,0.25);
        }
        .ref-btn-fb {
          background: #1877f2;
          color: #fff;
        }
        .ref-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124,58,237,0.35);
        }

        .ref-link-preview {
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.7);
          border: 1px dashed rgba(167,139,250,0.3);
        }
        .ref-link-preview-label {
          font-size: 10px;
          color: var(--text-2);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .ref-link-preview-value {
          font-size: 11px;
          font-family: ui-monospace, monospace;
          color: #7c3aed;
          word-break: break-all;
        }

        /* How to */
        .ref-howto {
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167,139,250,0.2);
          margin-bottom: 20px;
        }
        .ref-section-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-0);
          margin: 0 0 14px;
        }
        .ref-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ref-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(167,139,250,0.05);
        }
        .ref-step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-weight: 900;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ref-step-title {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-0);
        }
        .ref-step-desc {
          font-size: 11px;
          color: var(--text-2);
          margin-top: 1px;
        }

        /* List */
        .ref-list-section {
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167,139,250,0.2);
        }
        .ref-empty {
          text-align: center;
          padding: 32px 16px;
          color: var(--text-2);
        }
        .ref-empty-icon { font-size: 48px; margin-bottom: 8px; opacity: 0.5; }
        .ref-empty p { font-size: 14px; font-weight: 700; color: var(--text-1); margin: 0 0 4px; }
        .ref-empty span { font-size: 12px; }

        .ref-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ref-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(167,139,250,0.04);
          border: 1px solid rgba(167,139,250,0.1);
        }
        .ref-row-user {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .ref-row-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(167,139,250,0.4);
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ref-row-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ref-row-avatar-fallback { color: #fff; font-weight: 800; font-size: 14px; }
        .ref-row-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ref-row-date {
          font-size: 10px;
          color: var(--text-2);
          margin-top: 2px;
        }
        .ref-row-status {
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .ref-row-status.is-paid { color: #22c55e; }
        .ref-row-status.is-pending {
          color: #f59e0b;
          font-size: 11px;
        }
        .ref-row-icon { font-size: 12px; }

        @media (max-width: 640px) {
          .ref-page { padding: 20px 14px 80px; }
          .ref-title { font-size: 22px; }
          .ref-code-text { font-size: 16px; letter-spacing: 1px; }
          .ref-stats { gap: 6px; }
          .ref-stat-value { font-size: 15px; }
        }
      `}</style>
    </main>
  );
}
