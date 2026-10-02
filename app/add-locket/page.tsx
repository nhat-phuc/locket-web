"use client";

import { useState } from "react";
import Link from "next/link";

interface LocketProfile {
  valid: boolean;
  username?: string;
  avatar?: string | null;
  message?: string;
}

export default function AddLocketPage() {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<LocketProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // Check username
  const handleCheck = async () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Nhập username hoặc link Locket");
      return;
    }

    setChecking(true);
    setError("");
    setValid(null);
    setProfile(null);
    setSaved(false);

    try {
      const res = await fetch(
        `/api/locket/check?username=${encodeURIComponent(trimmed)}`
      );
      const data: LocketProfile = await res.json();

      if (data.valid) {
        setValid(true);
        setProfile(data);
        setDisplayName(data.username || "");
      } else {
        setValid(false);
        setError(data.message || "Username không tồn tại trên Locket");
      }
    } catch {
      setValid(false);
      setError("Không thể kiểm tra, vui lòng thử lại");
    } finally {
      setChecking(false);
    }
  };

  // Lưu vào DB
  const handleSave = async () => {
    if (!profile?.username) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/locket/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profile.username,
          displayName: displayName || profile.username,
          avatar: profile.avatar,
          bio: bio || null,
          profileUrl: `https://locket.cam/${profile.username}`,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSaved(true);
      } else {
        setError(data.message || "Không thể lưu");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  // Reset
  const handleReset = () => {
    setUsername("");
    setValid(null);
    setError("");
    setProfile(null);
    setSaved(false);
    setDisplayName("");
    setBio("");
  };

  return (
    <div className="al-page">
      {/* Background glows */}
      <div className="bg-3d-glow bg-3d-glow-1" />
      <div className="bg-3d-glow bg-3d-glow-2" />
      <div className="bg-3d-glow bg-3d-glow-3" />

      <div className="al-container">
        {/* Header */}
        <div className="al-header">
          <div className="al-badge">
            <span className="al-badge-dot" />
            THÊM LOCKET
          </div>
          <h1 className="al-title">
            Thêm <span className="al-gradient">Locket</span> của bạn
          </h1>
          <p className="al-subtitle">
            Nhập username Locket công khai để hệ thống lưu và hiển thị
          </p>
        </div>

        {/* Card */}
        <div className="al-card">
          {!saved ? (
            <>
              {/* Input username */}
              <div className="al-field">
                <label className="al-label">
                  Username hoặc link Locket <span className="al-req">*</span>
                </label>

                <div className="al-input-wrap">
                  <div className="al-input-icon-left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    placeholder="username hoặc locket.cam/username"
                    disabled={checking || saving}
                    className={`al-input ${valid === true ? "valid" : ""} ${valid === false ? "invalid" : ""}`}
                  />

                  <div className="al-input-icon-right">
                    {checking && <div className="al-spinner" />}
                    {!checking && valid === true && (
                      <div className="al-check-ok">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    {!checking && valid === false && (
                      <div className="al-check-err">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {!valid && (
                  <button
                    onClick={handleCheck}
                    disabled={checking || !username.trim()}
                    className="al-btn al-btn-check"
                  >
                    {checking ? "Đang kiểm tra..." : "Kiểm tra username"}
                  </button>
                )}
              </div>

              {/* Profile preview */}
              {valid === true && profile && (
                <>
                  <div className="al-profile">
                    <div className="al-avatar-wrap">
                      {profile.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatar}
                          alt={profile.username}
                          referrerPolicy="no-referrer"
                          className="al-avatar"
                        />
                      ) : (
                        <div className="al-avatar al-avatar-fallback">
                          {(profile.username || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="al-profile-info">
                      <div className="al-profile-name">@{profile.username}</div>
                      <div className="al-profile-status">
                        <span className="al-status-dot" />
                        Đã tìm thấy trên Locket
                      </div>
                    </div>
                  </div>

                  {/* Display name */}
                  <div className="al-field">
                    <label className="al-label">Tên hiển thị</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tên hiển thị"
                      className="al-input"
                      maxLength={50}
                    />
                  </div>

                  {/* Bio */}
                  <div className="al-field">
                    <label className="al-label">Giới thiệu (tùy chọn)</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Mô tả ngắn về bạn..."
                      className="al-input al-textarea"
                      rows={3}
                      maxLength={200}
                    />
                    <div className="al-char-count">{bio.length}/200</div>
                  </div>

                  {/* Action buttons */}
                  <div className="al-actions">
                    <button
                      onClick={handleReset}
                      disabled={saving}
                      className="al-btn al-btn-secondary"
                    >
                      ← Nhập lại
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="al-btn al-btn-primary"
                    >
                      {saving ? "Đang lưu..." : "Lưu Locket"}
                    </button>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="al-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="al-hint">
                🔒 Chúng tôi không cần mật khẩu, chỉ cần username công khai
              </div>
            </>
          ) : (
            /* ═══ SUCCESS ═══ */
            <div className="al-success">
              <div className="al-success-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Đã lưu thành công!</h2>
              <p>Locket <b>@{profile?.username}</b> đã được thêm vào hệ thống</p>

              <div className="al-success-actions">
                <button onClick={handleReset} className="al-btn al-btn-secondary">
                  Thêm Locket khác
                </button>
                <Link href="/" className="al-btn al-btn-primary">
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer link */}
        {!saved && (
          <Link href="/" className="al-back">
            ← Quay lại trang chủ
          </Link>
        )}
      </div>

      <style jsx>{`
        .al-page * {
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .al-page {
          position: relative;
          width: 100%;
          max-width: 100vw;
          min-height: 100vh;
          padding: 60px 16px 80px;
          background: var(--bg-0);
          overflow-x: hidden;
        }

        .al-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        /* ═══ HEADER ═══ */
        .al-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .al-badge {
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
        .al-badge-dot {
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

        .al-title {
          font-size: clamp(26px, 6vw, 38px);
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 12px;
          color: var(--text-0);
          letter-spacing: -0.02em;
        }
        .al-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .al-subtitle {
          font-size: clamp(13px, 4vw, 15px);
          color: var(--text-2);
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* ═══ CARD ═══ */
        .al-card {
          padding: 32px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.1);
          animation: cardIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .al-field { margin-bottom: 20px; }

        .al-label {
          display: block;
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--text-0);
        }
        .al-req { color: #ef4444; }

        /* ═══ INPUT ═══ */
        .al-input-wrap {
          position: relative;
          width: 100%;
          margin-bottom: 12px;
        }
        .al-input-icon-left {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-2);
          pointer-events: none;
          z-index: 1;
          display: flex;
        }
        .al-input-icon-right {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          display: flex;
        }

        .al-input {
          width: 100%;
          padding: 16px 44px 16px 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid var(--border);
          border-radius: 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-0);
          outline: none;
          transition: all 0.3s;
        }
        .al-input::placeholder {
          color: var(--text-2);
          opacity: 0.6;
          font-size: 13.5px;
        }
        .al-input:focus {
          border-color: #7c3aed;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }
        .al-input.valid {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
        }
        .al-input.invalid {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
        }
        .al-textarea {
          padding: 14px 16px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .al-char-count {
          text-align: right;
          font-size: 11.5px;
          color: var(--text-2);
          margin-top: 4px;
        }

        /* Spinner + icons */
        .al-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .al-check-ok,
        .al-check-err {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .al-check-ok {
          background: linear-gradient(135deg, #10b981, #34d399);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .al-check-err {
          background: linear-gradient(135deg, #ef4444, #f87171);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

        /* ═══ PROFILE ═══ */
        .al-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 16px 0;
          padding: 14px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.05));
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .al-avatar-wrap {
          width: 52px;
          height: 52px;
          min-width: 52px;
          min-height: 52px;
          max-width: 52px;
          max-height: 52px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 2.5px solid #10b981;
          background: #1a1230;
        }
        .al-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .al-avatar-fallback {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 22px;
          font-weight: 900;
        }

        .al-profile-info {
          flex: 1;
          min-width: 0;
        }
        .al-profile-name {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-0);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .al-profile-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #16a34a;
          font-weight: 700;
          margin-top: 2px;
        }
        .al-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
        }

        /* ═══ BUTTONS ═══ */
        .al-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          white-space: nowrap;
        }

        .al-btn-check {
          width: 100%;
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          border: 1.5px solid rgba(167, 139, 250, 0.3);
        }
        .al-btn-check:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.25);
          border-color: #a78bfa;
          transform: translateY(-2px);
        }

        .al-btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          color: #fff;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
          flex: 1;
        }
        .al-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.45);
        }

        .al-btn-secondary {
          background: rgba(167, 139, 250, 0.08);
          color: var(--text-1);
          border: 1.5px solid var(--border);
        }
        .al-btn-secondary:hover:not(:disabled) {
          background: rgba(167, 139, 250, 0.15);
          border-color: #a78bfa;
        }

        .al-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.3);
        }

        .al-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        /* ═══ ERROR ═══ */
        .al-error {
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
          animation: slideIn 0.4s;
        }
        .al-error svg { flex-shrink: 0; margin-top: 1px; }

        .al-hint {
          margin-top: 16px;
          font-size: 12.5px;
          color: var(--text-2);
          text-align: center;
        }

        /* ═══ SUCCESS ═══ */
        .al-success {
          text-align: center;
          padding: 24px 0;
          animation: cardIn 0.5s;
        }
        .al-success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.08));
          color: #10b981;
          margin-bottom: 20px;
          animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .al-success h2 {
          font-size: 24px;
          font-weight: 900;
          color: #10b981;
          margin-bottom: 8px;
        }
        .al-success p {
          font-size: 14.5px;
          color: var(--text-2);
          margin-bottom: 24px;
        }
        .al-success-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ═══ BACK LINK ═══ */
        .al-back {
          display: block;
          text-align: center;
          margin-top: 24px;
          color: var(--text-2);
          font-size: 13.5px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .al-back:hover { color: var(--accent-bright); }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 480px) {
          .al-page { padding: 40px 12px 60px; }
          .al-card { padding: 24px 18px; border-radius: 20px; }
          .al-input { padding: 14px 42px; font-size: 14px; }
          .al-avatar-wrap { width: 46px; height: 46px; min-width: 46px; min-height: 46px; max-width: 46px; max-height: 46px; }
          .al-avatar-fallback { font-size: 18px; }
          .al-btn { padding: 12px 20px; font-size: 14px; }
          .al-actions { flex-direction: column-reverse; }
          .al-success-actions { flex-direction: column; }
          .al-success-actions .al-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
