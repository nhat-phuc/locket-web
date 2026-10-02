"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LocketProfile {
  valid: boolean;
  username?: string;
  avatar?: string | null;
  message?: string;
}

function KichHoatForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<LocketProfile | null>(null);

  useEffect(() => {
    const trimmed = username.trim();

    if (!trimmed || trimmed.length < 2) {
      setValid(null);
      setError("");
      setChecking(false);
      setProfile(null);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locket/check?username=${encodeURIComponent(trimmed)}`
        );
        const data: LocketProfile = await res.json();

        if (data.valid) {
          setValid(true);
          setError("");
          setProfile(data);
        } else {
          setValid(false);
          setError(data.message || "Username hoặc link Locket không đúng");
          setProfile(null);
        }
      } catch {
        setValid(false);
        setError("Không thể kiểm tra, vui lòng thử lại");
        setProfile(null);
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [username]);

  const handleContinue = () => {
    if (valid === true && profile) {
      sessionStorage.setItem("locket_username", profile.username || username);
      router.push("/bang-gia");
    }
  };

  return (
    <div className="kh-page">
      {/* Background glow */}
      <div className="kh-glow kh-glow-1" />
      <div className="kh-glow kh-glow-2" />
      <div className="kh-glow kh-glow-3" />

      <div className="kh-container">
        {/* Header */}
        <div className="kh-header">
          <div className="kh-badge">⚡ KÍCH HOẠT NHANH</div>
          <h1 className="kh-title">
            Kích hoạt <span className="kh-gradient">dịch vụ</span>
          </h1>
          <p className="kh-subtitle">
            Nhập username Locket để kiểm tra và nhận ưu đãi
          </p>
        </div>

        {/* Card */}
        <div className="kh-card">
          <div className="kh-field">
            <label className="kh-label">
              Username hoặc link Locket <span className="kh-req">*</span>
            </label>

            <div className="kh-input-wrap">
              <div className="kh-input-icon-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username hoặc locket.cam/username"
                disabled={checking}
                className={`kh-input ${valid === true ? "valid" : ""} ${valid === false ? "invalid" : ""}`}
              />

              <div className="kh-input-icon-right">
                {checking && <div className="kh-spinner" />}
                {!checking && valid === true && (
                  <div className="kh-check-ok">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                {!checking && valid === false && (
                  <div className="kh-check-err">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Profile preview */}
            {valid === true && profile && (
              <div className="kh-profile">
                <div className="kh-avatar-wrap">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      referrerPolicy="no-referrer"
                      className="kh-avatar"
                    />
                  ) : (
                    <div className="kh-avatar kh-avatar-fallback">
                      {(profile.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="kh-avatar-ring" />
                </div>

                <div className="kh-profile-info">
                  <div className="kh-profile-name">@{profile.username}</div>
                  <div className="kh-profile-status">
                    <span className="kh-status-dot" />
                    Đã tìm thấy trên Locket
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {valid === false && error && (
              <div className="kh-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="kh-hint">
              🔒 Chúng tôi không cần mật khẩu, chỉ cần username công khai
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={valid !== true || checking}
            className="kh-btn"
          >
            {valid === true ? (
              <>
                Tiếp tục
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            ) : (
              "Kiểm tra username"
            )}
          </button>

          <Link href="/" className="kh-back">
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Footer stats */}
        <div className="kh-stats">
          <div className="kh-stat">
            <div className="kh-stat-num">10K+</div>
            <div className="kh-stat-label">Đã kích hoạt</div>
          </div>
          <div className="kh-stat-divider" />
          <div className="kh-stat">
            <div className="kh-stat-num">5s</div>
            <div className="kh-stat-label">Xử lý tự động</div>
          </div>
          <div className="kh-stat-divider" />
          <div className="kh-stat">
            <div className="kh-stat-num">100%</div>
            <div className="kh-stat-label">An toàn</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kh-page {
          position: relative;
          min-height: 100vh;
          padding: 60px 20px 80px;
          overflow: hidden;
          background: var(--bg-0);
        }

        /* Glow backgrounds */
        .kh-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        .kh-glow-1 {
          width: 400px; height: 400px;
          background: #a78bfa;
          top: -100px; left: -100px;
        }
        .kh-glow-2 {
          width: 350px; height: 350px;
          background: #7c3aed;
          top: 30%; right: -100px;
          animation-delay: 2s;
        }
        .kh-glow-3 {
          width: 300px; height: 300px;
          background: #10b981;
          bottom: -100px; left: 30%;
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        /* Container */
        .kh-container {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
        }

        /* Header */
        .kh-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .kh-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
          animation: pulseBadge 2s ease-in-out infinite;
        }
        @keyframes pulseBadge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(167, 139, 250, 0); }
        }

        .kh-title {
          font-size: 38px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 12px;
          color: var(--text-0);
          letter-spacing: -0.02em;
        }
        .kh-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .kh-subtitle {
          font-size: 15px;
          color: var(--text-2);
          max-width: 400px;
          margin: 0 auto;
        }

        /* Card */
        .kh-card {
          padding: 32px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 24px;
          box-shadow:
            0 20px 60px rgba(124, 58, 237, 0.1),
            0 8px 24px rgba(0, 0, 0, 0.04);
          animation: cardIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kh-field {
          margin-bottom: 20px;
        }

        .kh-label {
          display: block;
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--text-0);
        }
        .kh-req { color: #ef4444; }

        /* Input wrapper */
        .kh-input-wrap {
          position: relative;
        }
        .kh-input-icon-left {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-2);
          pointer-events: none;
          z-index: 1;
        }
        .kh-input-icon-right {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }

        .kh-input {
          width: 100%;
          padding: 16px 48px 16px 48px;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-radius: 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-0);
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kh-input::placeholder {
          color: var(--text-2);
          opacity: 0.6;
        }
        .kh-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }
        .kh-input.valid {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
        }
        .kh-input.invalid {
          border-color: #ef4444;
          background: #fef2f2;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
        }

        /* Spinner */
        .kh-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(167, 139, 250, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Check icons */
        .kh-check-ok, .kh-check-err {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .kh-check-ok {
          background: linear-gradient(135deg, #10b981, #34d399);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .kh-check-err {
          background: linear-gradient(135deg, #ef4444, #f87171);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        /* Profile preview */
        .kh-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.05));
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kh-avatar-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }
        .kh-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid #10b981;
          position: relative;
          z-index: 2;
          background: #1a1230;
        }
        .kh-avatar-fallback {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 24px;
          font-weight: 900;
        }
        .kh-avatar-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #10b981, #34d399, #10b981);
          animation: spinRing 3s linear infinite;
          z-index: 1;
          opacity: 0.5;
          filter: blur(2px);
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }

        .kh-profile-info {
          flex: 1;
          min-width: 0;
        }
        .kh-profile-name {
          font-size: 18px;
          font-weight: 900;
          color: var(--text-0);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kh-profile-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #16a34a;
          font-weight: 700;
        }
        .kh-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        }

        /* Error */
        .kh-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.05));
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kh-hint {
          margin-top: 12px;
          font-size: 12.5px;
          color: var(--text-2);
        }

        /* Button */
        .kh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px 24px;
          margin-top: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
          position: relative;
          overflow: hidden;
        }
        .kh-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.45);
        }
        .kh-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .kh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.3);
        }
        .kh-btn::before {
          content: "";
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s;
        }
        .kh-btn:not(:disabled):hover::before {
          left: 100%;
        }

        .kh-back {
          display: block;
          text-align: center;
          margin-top: 16px;
          color: var(--text-2);
          font-size: 13.5px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .kh-back:hover {
          color: var(--accent-bright);
        }

        /* Stats footer */
        .kh-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(167, 139, 250, 0.15);
          border-radius: 16px;
          animation: cardIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kh-stat {
          text-align: center;
        }
        .kh-stat-num {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2px;
        }
        .kh-stat-label {
          font-size: 11.5px;
          color: var(--text-2);
          font-weight: 600;
        }
        .kh-stat-divider {
          width: 1px;
          height: 30px;
          background: rgba(167, 139, 250, 0.2);
        }

        /* Mobile */
        @media (max-width: 480px) {
          .kh-title { font-size: 28px; }
          .kh-card { padding: 24px 20px; border-radius: 20px; }
          .kh-input { padding: 14px 44px; font-size: 14px; }
          .kh-stats { gap: 16px; padding: 16px; }
          .kh-stat-num { font-size: 18px; }
          .kh-stat-label { font-size: 10.5px; }
        }
      `}</style>
    </div>
  );
}

export default function KichHoatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center" }}>Đang tải...</div>}>
      <KichHoatForm />
    </Suspense>
  );
}
