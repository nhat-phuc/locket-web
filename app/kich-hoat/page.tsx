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
  const [dnsDownloaded, setDnsDownloaded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(
      /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }, []);

  // AUTO CHECK — chỉ check khi user ngừng gõ 1.2s + username >= 3 ký tự
  useEffect(() => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
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
          setError(data.message || "Username không đúng");
          setProfile(null);
        }
      } catch {
        setValid(false);
        setError("Không thể kiểm tra");
        setProfile(null);
      } finally {
        setChecking(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [username]);

  const handleDownloadDNS = () => {
    const link = document.createElement("a");
    link.href = "/files/locket-vip.mobileconfig";
    link.download = "locket-vip.mobileconfig";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDnsDownloaded(true);
  };

  const handleBuyPackage = () => {
    if (valid === true && profile) {
      sessionStorage.setItem("locket_username", profile.username || username);
    }
    router.push("/bang-gia");
  };

  // Tải avatar về máy khi click vào ảnh
  const handleDownloadAvatar = async () => {
    if (!profile?.avatar) return;
    try {
      const res = await fetch(profile.avatar);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `locket-${profile.username || "avatar"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: mở ảnh trong tab mới
      window.open(profile.avatar, "_blank");
    }
  };

  return (
    <div className="kh-page">
      <div className="bg-3d-glow bg-3d-glow-1" />
      <div className="bg-3d-glow bg-3d-glow-2" />
      <div className="bg-3d-glow bg-3d-glow-3" />

      <div className="kh-container">
        <div className="kh-header">
          <div className="kh-badge">
            <span className="kh-badge-dot" />
            KÍCH HOẠT NHANH
          </div>
          <h1 className="kh-title">
            Kích hoạt <span className="kh-gradient">dịch vụ</span>
          </h1>
          <p className="kh-subtitle">
            Nhập username Locket để kiểm tra và nhận ưu đãi
          </p>
        </div>

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
                className={`kh-input ${valid === true ? "valid" : ""} ${valid === false ? "invalid" : ""}`}
              />

              <div className="kh-input-icon-right">
                {checking && <div className="kh-spinner" />}
                {!checking && valid === true && (
                  <div className="kh-check-ok">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                {!checking && valid === false && (
                  <div className="kh-check-err">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {valid === true && profile && (
              <div className="kh-profile">
                <div
                  className="kh-avatar-wrap"
                  onClick={handleDownloadAvatar}
                  title="Bấm để tải avatar về máy"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: profile.avatar ? "pointer" : "default" }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      referrerPolicy="no-referrer"
                      className="kh-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "grid";
                      }}
                    />
                  ) : null}
                  <div className="kh-avatar-fallback" style={{ display: profile.avatar ? "none" : "grid" }}>
                    {(profile.username || "U").charAt(0).toUpperCase()}
                  </div>
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

            {valid === false && error && (
              <div className="kh-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="kh-hint">
              🔒 Không cần mật khẩu, chỉ cần username công khai
            </div>
            <div className="kh-hint-note">⚠️ CHÚ Ý: Nhập đúng username Locket, không nhập mật khẩu</div>
          </div>

          {/* 3 BƯỚC HƯỚNG DẪN */}
          <div className="kh-steps">
            <div className="kh-step">
              <div className="kh-step-num">1</div>
              <div className="kh-step-text">
                <b>Nhập username Locket</b>
                <span>Kiểm tra hợp lệ phía trên</span>
              </div>
            </div>
            <div className="kh-step">
              <div className="kh-step-num">2</div>
              <div className="kh-step-text">
                <b>Tải DNS về máy</b>
                <span>Bấm nút vàng bên dưới để cài profile</span>
              </div>
            </div>
            <div className="kh-step">
              <div className="kh-step-num">3</div>
              <div className="kh-step-text">
                <b>Mua gói dịch vụ</b>
                <span>Bấm nút xanh bên dưới để chọn gói</span>
              </div>
            </div>
          </div>

          {/* NÚT TẢI DNS — VÀNG + PULSE */}
          <button onClick={handleDownloadDNS} className="kh-btn-dns">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Tải DNS về máy (.mobileconfig)</span>
          </button>

          {dnsDownloaded && isIOS && (
            <div className="kh-dns-guide">
              📱 Mở <b>Cài đặt</b> → <b>Đã tải về Profile</b> → Bấm <b>Cài đặt</b> → Nhập mật khẩu máy → <b>Cài đặt</b>
            </div>
          )}

          {dnsDownloaded && !isIOS && (
            <div className="kh-dns-warn">
              ⚠️ File DNS chỉ cài được trên <b>iPhone / iPad</b>. Vui lòng mở link này trên Safari của iPhone.
            </div>
          )}

          {/* NÚT MUA GÓI — XANH LÁ + PULSE */}
          <button onClick={handleBuyPackage} className="kh-btn-buy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Mua gói dịch vụ</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <Link href="/" className="kh-back-btn" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            marginTop: "18px",
            padding: "13px 20px",
            background: "rgba(167, 139, 250, 0.08)",
            border: "1.5px solid rgba(167, 139, 250, 0.35)",
            borderRadius: "14px",
            color: "#7c3aed",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

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
        .kh-page * { box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word; }
        .kh-page {
          position: relative;
          width: 100%;
          max-width: 100vw;
          min-height: 100vh;
          padding: 60px 16px 80px;
          background: var(--bg-0);
          overflow-x: hidden;
          overflow-y: auto;
        }
        .kh-container { position: relative; z-index: 1; width: 100%; max-width: 560px; margin: 0 auto; }
        .kh-header { text-align: center; margin-bottom: 32px; }
        .kh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }
        .kh-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          animation: pulseBadge 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulseBadge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(167, 139, 250, 0); }
        }
        .kh-title {
          font-size: clamp(26px, 6vw, 38px);
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
          font-size: clamp(13px, 4vw, 15px);
          color: var(--text-2);
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .kh-card {
          padding: 32px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.1), 0 8px 24px rgba(0, 0, 0, 0.04);
          animation: cardIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kh-field { margin-bottom: 20px; }
        .kh-label { display: block; font-weight: 700; margin-bottom: 10px; font-size: 14px; color: var(--text-0); }
        .kh-req { color: #ef4444; }
        .kh-input-wrap { position: relative; width: 100%; }
        .kh-input-icon-left {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-2);
          pointer-events: none;
          z-index: 1;
          display: flex;
          align-items: center;
        }
        .kh-input-icon-right {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          display: flex;
          align-items: center;
        }
        .kh-input {
          width: 100%;
          padding: 16px 44px 16px 44px;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-radius: 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-0);
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-overflow: ellipsis;
        }
        .kh-input::placeholder { color: var(--text-2); opacity: 0.6; font-size: 13.5px; }
        .kh-input:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12); }
        .kh-input.valid { border-color: #10b981; background: #f0fdf4; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12); }
        .kh-input.invalid { border-color: #ef4444; background: #fef2f2; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12); }
        .kh-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .kh-check-ok, .kh-check-err {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }
        .kh-check-ok { background: linear-gradient(135deg, #10b981, #34d399); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        .kh-check-err { background: linear-gradient(135deg, #ef4444, #f87171); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
        .kh-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.05));
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kh-avatar-wrap {
          width: 72px;
          height: 72px;
          min-width: 72px;
          min-height: 72px;
          max-width: 72px;
          max-height: 72px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 2.5px solid #10b981;
          background: #1a1230;
          display: grid;
          place-items: center;
          position: relative;
        }
        .kh-avatar-wrap {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .kh-avatar-wrap:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
        }
        .kh-avatar-wrap:active {
          transform: scale(0.96);
        }
        .kh-avatar-wrap::after {
          content: "⬇";
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          z-index: 2;
        }
        .kh-avatar-wrap:hover::after {
          opacity: 1;
          transform: scale(1);
        }
        .kh-avatar { width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; inset: 0; }
        .kh-avatar-fallback {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 28px;
          font-weight: 900;
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
        }
        .kh-profile-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .kh-profile-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-0);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kh-profile-status { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #16a34a; font-weight: 700; }
        .kh-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
        }
        .kh-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 12px;
          padding: 12px 14px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.05));
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.4;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kh-error svg { flex-shrink: 0; margin-top: 1px; }
        .kh-hint { margin-top: 12px; font-size: 12.5px; color: var(--text-2); line-height: 1.4; }
        .kh-hint-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.05));
          border: 1.5px solid rgba(239, 68, 68, 0.35);
          border-radius: 12px;
          color: #dc2626;
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.4;
          animation: hintNotePulse 2s ease-in-out infinite;
        }
        @keyframes hintNotePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            border-color: rgba(239, 68, 68, 0.35);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0), 0 0 20px rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.7);
          }
        }

        /* 3 BƯỚC HƯỚNG DẪN — HIỆU ỨNG ĐỎ */
        .kh-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
          margin-bottom: 4px;
        }
        .kh-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(248, 113, 113, 0.03));
          border: 1.5px dashed rgba(239, 68, 68, 0.4);
          border-radius: 12px;
          animation: redPulse 2s ease-in-out infinite;
        }
        @keyframes redPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            border-color: rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0), 0 0 20px rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.7);
          }
        }
        .kh-step-num {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
        }
        .kh-step-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .kh-step-text b { font-size: 13.5px; color: #dc2626; font-weight: 800; }
        .kh-step-text span { font-size: 12px; color: var(--text-2); }

        /* NÚT TẢI DNS — VÀNG + PULSE */
        .kh-btn-dns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px 24px;
          margin-top: 12px;
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15.5px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
          position: relative;
          overflow: hidden;
          animation: yellowPulse 2s ease-in-out infinite;
        }
        .kh-btn-dns:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5);
          animation-play-state: paused;
        }
        .kh-btn-dns:active { transform: translateY(0) scale(0.99); }
        .kh-btn-dns::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s;
        }
        .kh-btn-dns:hover::before { left: 100%; }
        @keyframes yellowPulse {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35), 0 0 0 0 rgba(124, 58, 237, 0.5);
          }
          50% {
            box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5), 0 0 0 10px rgba(124, 58, 237, 0);
          }
        }

        /* NÚT MUA GÓI — XANH LÁ + PULSE */
        .kh-btn-buy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px 24px;
          margin-top: 12px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15.5px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
          position: relative;
          overflow: hidden;
          animation: greenPulse 2s ease-in-out infinite;
        }
        .kh-btn-buy:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
          animation-play-state: paused;
        }
        .kh-btn-buy:active { transform: translateY(0) scale(0.99); }
        .kh-btn-buy::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s;
        }
        .kh-btn-buy:hover::before { left: 100%; }
        @keyframes greenPulse {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          50% {
            box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5), 0 0 0 10px rgba(16, 185, 129, 0);
          }
        }

        .kh-dns-guide, .kh-dns-warn {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 12.5px;
          line-height: 1.5;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kh-dns-guide {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(167, 139, 250, 0.05));
          border: 1.5px solid rgba(124, 58, 237, 0.35);
          color: #7c3aed;
        }
        .kh-dns-warn {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(167, 139, 250, 0.05));
          border: 1.5px solid rgba(124, 58, 237, 0.3);
          color: #7c3aed;
        }
        
        
        .kh-back-btn:hover {
          background: rgba(167, 139, 250, 0.15);
          border-color: #7c3aed;
          color: #6d28d9;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.2);
        }
        
        
        
        
        .kh-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 18px;
          padding: 13px 20px;
          background: rgba(167, 139, 250, 0.08);
          border: 1.5px solid rgba(167, 139, 250, 0.35);
          border-radius: 14px;
          color: #7c3aed;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .kh-back-btn svg { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .kh-back-btn:hover {
          background: rgba(167, 139, 250, 0.15);
          border-color: #7c3aed;
          color: #6d28d9;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.2);
        }
        .kh-back-btn:hover svg { transform: translateX(-4px); }
        .kh-back-btn:active { transform: translateY(0) scale(0.98); }
        .kh-back-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.2), transparent);
          transition: left 0.6s;
        }
        .kh-back-btn:hover::before { left: 100%; }
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
        .kh-stat { text-align: center; flex-shrink: 0; }
        .kh-stat-num {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .kh-stat-label { font-size: 11.5px; color: var(--text-2); font-weight: 600; white-space: nowrap; }
        .kh-stat-divider { width: 1px; height: 30px; background: rgba(167, 139, 250, 0.2); flex-shrink: 0; }

        @media (max-width: 480px) {
          .kh-page { padding: 40px 12px 60px; }
          .kh-card { padding: 24px 18px; border-radius: 20px; }
          .kh-input { padding: 14px 42px; font-size: 14px; }
          .kh-input::placeholder { font-size: 12.5px; }
          .kh-avatar-wrap { width: 64px; height: 64px; min-width: 64px; min-height: 64px; max-width: 64px; max-height: 64px; }
          .kh-avatar-fallback { font-size: 24px; }
          .kh-profile-name { font-size: 18px; }
          .kh-profile-status { font-size: 13px; }
          .kh-btn-dns { padding: 14px 18px; font-size: 14px; }
          .kh-btn-buy { padding: 14px 18px; font-size: 14px; }
          .kh-stats { gap: 16px; padding: 16px; }
          .kh-stat-num { font-size: 18px; }
          .kh-stat-label { font-size: 10.5px; }
          .kh-stat-divider { height: 26px; }
        }
        @media (max-width: 360px) {
          .kh-stats { gap: 12px; padding: 12px; }
          .kh-stat-num { font-size: 16px; }
          .kh-stat-label { font-size: 10px; }
          .kh-stat-divider { height: 22px; }
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
