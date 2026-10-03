"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LocketProfile {
  valid: boolean;
  username?: string;
  avatar?: string | null;
  displayName?: string | null;
  message?: string;
}

const BADGES = [
  { value: "", label: "Không có" },
  { value: "VIP", label: "VIP" },
  { value: "GOLD", label: "GOLD" },
  { value: "HOT", label: "HOT" },
  { value: "NEW", label: "NEW" },
  { value: "PRO", label: "PRO" },
];

export default function AddLocketPage() {
  const [link, setLink] = useState("");
  const [checking, setChecking] = useState(false);
  const [profile, setProfile] = useState<LocketProfile | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [cover, setCover] = useState("");
  const [badge, setBadge] = useState("");
  const [uploading, setUploading] = useState(false);

  const extractUsername = (input: string): string => {
    let s = input.trim().split("?")[0].split("#")[0].replace(/\/+$/, "");
    if (s.includes("locket.cam/")) return s.split("locket.cam/").pop() || "";
    if (s.startsWith("http")) {
      try {
        const url = new URL(s);
        return url.pathname.split("/").filter(Boolean)[0] || "";
      } catch {
        return s;
      }
    }
    return s.replace(/^@/, "");
  };

  useEffect(() => {
    const u = extractUsername(link);
    if (!u || u.length < 2) {
      setProfile(null);
      setError("");
      return;
    }
    const t = setTimeout(async () => {
      setChecking(true);
      setError("");
      setProfile(null);
      try {
        const res = await fetch(`/api/locket/check?username=${encodeURIComponent(u)}`);
        const data = await res.json();
        if (data.valid && data.username) {
          setProfile(data);
          setDisplayName(data.displayName || data.username || "");
        } else {
          setError(data.message || "Không tìm thấy Locket này");
        }
      } catch {
        setError("Lỗi kiểm tra, thử lại sau");
      } finally {
        setChecking(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [link]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "cover");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setCover(data.url);
      } else {
        setError(data.message || "Upload thất bại");
      }
    } catch {
      setError("Lỗi upload");
    } finally {
      setUploading(false);
    }
  };

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
          displayName: displayName || profile.displayName || profile.username,
          avatar: profile.avatar,
          cover: cover || null,
          bio: bio || null,
          badge: badge || null,
          profileUrl: `https://locket.cam/${profile.username}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setLink("");
        setProfile(null);
        setDisplayName("");
        setBio("");
        setCover("");
        setBadge("");
        window.dispatchEvent(new Event("locket-added"));
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || "Không thể lưu");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLink("");
    setProfile(null);
    setError("");
    setDisplayName("");
    setBio("");
    setCover("");
    setBadge("");
  };

  const previewAvatar = profile?.avatar ||
    `https://ui-avatars.com/api/?name=${profile?.username || "user"}&background=7c3aed&color=fff`;

  return (
    <main className="alp-page">
      <div className="alp-orb alp-orb-1" />
      <div className="alp-orb alp-orb-2" />
      <div className="alp-orb alp-orb-3" />

      <div className="alp-container">
        <Link href="/" className="alp-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Link>

        <div className="alp-header">
          <div className="alp-badge">
            <span>✨</span> THÊM LOCKET
          </div>
          <h1 className="alp-title">
            Thêm <span className="alp-title-gradient">Locket của bạn</span>
          </h1>
          <p className="alp-subtitle">
            Dán link — hệ thống tự động lấy avatar và tên
          </p>
        </div>

        <div className="alp-layout">
          {/* FORM */}
          <div className="alp-card">
            {/* Link */}
            <div className="alp-field">
              <label className="alp-label">
                Link Locket <span className="alp-req">*</span>
              </label>
              <div className={`alp-input-wrap ${profile ? "is-valid" : ""} ${error ? "is-error" : ""}`}>
                <svg className="alp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://locket.cam/username"
                  className="alp-input"
                  autoFocus
                />
                {checking && <span className="alp-spinner" />}
                {profile?.valid && !checking && (
                  <svg className="alp-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {error && (
                <div className="alp-status alp-status-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}
              {saved && (
                <div className="alp-status alp-status-success">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã lưu thành công!
                </div>
              )}
            </div>

            {profile?.valid && !saved && (
              <>
                {/* Tên hiển thị */}
                <div className="alp-field">
                  <label className="alp-label">Tên hiển thị</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Mặc định = username"
                    className="alp-input alp-input-plain"
                  />
                </div>

                {/* Ảnh bìa */}
                <div className="alp-field">
                  <label className="alp-label">
                    Ảnh bìa <span className="alp-opt">(tùy chọn)</span>
                  </label>
                  <div className="alp-cover-row">
                    <input
                      type="text"
                      value={cover}
                      onChange={(e) => setCover(e.target.value)}
                      placeholder="URL ảnh hoặc bấm Upload"
                      className="alp-input alp-input-plain"
                    />
                    <label className={`alp-upload-btn ${uploading ? "is-loading" : ""}`}>
                      {uploading ? (
                        <span className="alp-spinner alp-spinner-white" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {/* Huy hiệu */}
                <div className="alp-field">
                  <label className="alp-label">Huy hiệu</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="alp-input alp-input-plain alp-select"
                  >
                    {BADGES.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div className="alp-field">
                  <label className="alp-label">Mô tả ngắn</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu ngắn (không bắt buộc)"
                    className="alp-input alp-input-plain alp-textarea"
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="alp-actions">
                  <button onClick={handleSave} disabled={saving} className="alp-btn alp-btn-save">
                    {saving ? (
                      <>
                        <span className="alp-spinner alp-spinner-white" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Lưu Locket
                      </>
                    )}
                  </button>
                  <button onClick={handleReset} className="alp-btn alp-btn-cancel">Hủy</button>
                </div>
              </>
            )}

            <div className="alp-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Không cần mật khẩu, chỉ cần link công khai
            </div>
          </div>

          {/* PREVIEW */}
          <div className="alp-preview-panel">
            <div className="alp-preview-label">👁 XEM TRƯỚC</div>
            <div className="alp-preview-card">
              {cover && (
                <div className="alp-preview-cover">
                  <img
                    src={cover}
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className={`alp-preview-avatar ${cover ? "has-cover" : ""}`}>
                <img
                  src={previewAvatar}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${profile?.username || "user"}&background=7c3aed&color=fff`;
                  }}
                />
                {badge && <span className="alp-preview-badge-tag">{badge}</span>}
              </div>
              <div className="alp-preview-body">
                <div className="alp-preview-name">
                  {displayName || profile?.username || "Tên hiển thị"}
                </div>
                <div className="alp-preview-username">
                  @{profile?.username || "username"}
                </div>
                {bio && <div className="alp-preview-bio">{bio}</div>}
              </div>
            </div>
            <p className="alp-preview-hint">
              Card sẽ hiển thị như thế này trên trang chủ
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .alp-page {
          position: relative;
          min-height: 100vh;
          padding: 32px 20px 80px;
          background: var(--bg-0);
          overflow: hidden;
        }
        .alp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.35;
        }
        .alp-orb-1 { width: 300px; height: 300px; top: -80px; left: -80px; background: radial-gradient(circle, #7c3aed, transparent 70%); }
        .alp-orb-2 { width: 300px; height: 300px; top: 30%; right: -100px; background: radial-gradient(circle, #ec4899, transparent 70%); }
        .alp-orb-3 { width: 250px; height: 250px; bottom: -80px; left: 40%; background: radial-gradient(circle, #a78bfa, transparent 70%); }
        .alp-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          z-index: 1;
        }
        .alp-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text-2);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .alp-back:hover { color: var(--accent-bright); transform: translateX(-3px); }
        .alp-header { text-align: center; margin-bottom: 24px; }
        .alp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(167,139,250,.12), rgba(236,72,153,.12));
          border: 1px solid rgba(167,139,250,.3);
          color: var(--accent-bright);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .alp-title {
          font-size: 28px;
          font-weight: 900;
          line-height: 1.15;
          color: var(--text-0);
          margin: 0 0 6px;
        }
        .alp-title-gradient {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .alp-subtitle {
          font-size: 12px;
          color: var(--text-2);
          margin: 0;
        }
        .alp-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          align-items: start;
        }
        .alp-card {
          padding: 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 24px rgba(124, 58, 237, 0.08);
        }
        .alp-field { margin-bottom: 14px; }
        .alp-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-0);
          margin-bottom: 6px;
        }
        .alp-req { color: #ef4444; }
        .alp-opt { color: var(--text-2); font-weight: 500; font-size: 11px; }

        .alp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          transition: all 0.2s;
        }
        .alp-input-wrap:focus-within {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
        }
        .alp-input-wrap.is-valid {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }
        .alp-input-wrap.is-error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        .alp-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-2);
          pointer-events: none;
        }
        .alp-input {
          width: 100%;
          padding: 11px 40px 11px 38px;
          border: none;
          background: transparent;
          color: var(--text-0);
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }
        .alp-input-plain {
          padding: 11px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          transition: all 0.2s;
          width: 100%;
          font-family: inherit;
          color: var(--text-0);
          font-size: 13px;
          outline: none;
        }
        .alp-input-plain:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
        }
        .alp-textarea {
          resize: vertical;
          min-height: 60px;
          line-height: 1.5;
        }
        .alp-select { cursor: pointer; }
        .alp-input::placeholder, .alp-input-plain::placeholder { color: #9ca3af; }

        .alp-spinner {
          position: absolute;
          right: 14px;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(167, 139, 250, 0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: alpSpin 0.7s linear infinite;
        }
        .alp-spinner-white {
          position: static;
          border-color: rgba(255,255,255,0.3);
          border-top-color: #fff;
          width: 13px;
          height: 13px;
        }
        @keyframes alpSpin { to { transform: rotate(360deg); } }
        .alp-check {
          position: absolute;
          right: 14px;
          color: #22c55e;
        }
        .alp-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
        }
        .alp-status-error { color: #ef4444; background: rgba(239, 68, 68, 0.08); }
        .alp-status-success { color: #22c55e; background: rgba(34, 197, 94, 0.08); }

        .alp-cover-row {
          display: flex;
          gap: 8px;
        }
        .alp-cover-row .alp-input-plain { flex: 1; }
        .alp-upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
          transition: all 0.2s;
        }
        .alp-upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
        }
        .alp-upload-btn.is-loading { opacity: 0.6; cursor: wait; }

        .alp-actions {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }
        .alp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .alp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .alp-btn-save {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
        }
        .alp-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(34, 197, 94, 0.4);
        }
        .alp-btn-cancel {
          background: rgba(167, 139, 250, 0.08);
          color: var(--text-1);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
        }
        .alp-btn-cancel:hover { background: rgba(167, 139, 250, 0.15); }

        .alp-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed rgba(167, 139, 250, 0.2);
          font-size: 11px;
          color: var(--text-2);
          font-weight: 500;
        }

        /* PREVIEW */
        .alp-preview-panel {
          position: sticky;
          top: 24px;
        }
        .alp-preview-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--text-2);
          text-align: center;
          margin-bottom: 10px;
        }
        .alp-preview-card {
          position: relative;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 16px;
          padding-top: 50px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1);
        }
        .alp-preview-cover {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          border-radius: 18px;
        }
        .alp-preview-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .alp-preview-cover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%);
          z-index: 1;
        }
        .alp-preview-avatar {
          position: relative;
          z-index: 2;
          width: 70px;
          height: 70px;
          margin-bottom: 10px;
        }
        .alp-preview-avatar.has-cover { margin-top: 30px; }
        .alp-preview-avatar img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 3px solid #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .alp-preview-badge-tag {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          white-space: nowrap;
          border: 2px solid #fff;
        }
        .alp-preview-body {
          position: relative;
          z-index: 2;
          text-align: center;
          width: 100%;
        }
        .alp-preview-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .alp-preview-card:has(.alp-preview-cover) .alp-preview-name {
          color: #fff;
          text-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        .alp-preview-username {
          font-size: 11px;
          color: #7c3aed;
          font-weight: 600;
          margin-top: 2px;
        }
        .alp-preview-card:has(.alp-preview-cover) .alp-preview-username {
          color: #fff;
          text-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        .alp-preview-bio {
          font-size: 10px;
          color: var(--text-2);
          margin-top: 4px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .alp-preview-card:has(.alp-preview-cover) .alp-preview-bio {
          color: rgba(255,255,255,0.85);
        }
        .alp-preview-hint {
          font-size: 10px;
          color: var(--text-2);
          text-align: center;
          margin-top: 10px;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .alp-layout { grid-template-columns: 1fr; gap: 14px; }
          .alp-preview-panel { position: static; }
        }
        @media (max-width: 640px) {
          .alp-page { padding: 20px 14px 70px; }
          .alp-title { font-size: 22px; }
          .alp-card { padding: 16px; border-radius: 16px; }
          .alp-actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
