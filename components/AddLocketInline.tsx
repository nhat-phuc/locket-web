"use client";

import { useState } from "react";

interface LocketProfile {
  valid: boolean;
  username?: string;
  avatar?: string | null;
  displayName?: string | null;
  message?: string;
}

export default function AddLocketInline({ onSuccess }: { onSuccess?: () => void }) {
  const [link, setLink] = useState("");
  const [checking, setChecking] = useState(false);
  const [profile, setProfile] = useState<LocketProfile | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Chuẩn hóa link → username
  const extractUsername = (input: string): string => {
    let s = input.trim();
    // Xóa query string, hash
    s = s.split("?")[0].split("#")[0];
    // Xóa trailing slash
    s = s.replace(/\/+$/, "");
    // Nếu là URL đầy đủ
    if (s.includes("locket.cam/")) {
      return s.split("locket.cam/").pop() || "";
    }
    // Nếu có https:// hoặc domain khác
    if (s.startsWith("http")) {
      try {
        const url = new URL(s);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || "";
      } catch {
        return s;
      }
    }
    // Nếu chỉ là username
    return s.replace(/^@/, "");
  };

  const handleCheck = async () => {
    const username = extractUsername(link);
    if (!username || username.length < 2) {
      setError("Link hoặc username không hợp lệ");
      return;
    }

    setChecking(true);
    setError("");
    setProfile(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/locket/check?username=${encodeURIComponent(username)}`);
      const data: LocketProfile = await res.json();

      if (data.valid && data.username) {
        setProfile(data);
      } else {
        setError(data.message || "Không tìm thấy Locket này. Kiểm tra lại link!");
      }
    } catch {
      setError("Không thể kiểm tra, vui lòng thử lại");
    } finally {
      setChecking(false);
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
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          profileUrl: `https://locket.cam/${profile.username}`,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSaved(true);
        setLink("");
        window.dispatchEvent(new Event("locket-added"));
        setProfile(null);
        onSuccess?.();
      } else {
        setError(data.message || "Không thể lưu");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ali-wrap">
      <div className="ali-header">
        <div className="ali-badge">✨ THÊM LOCKET</div>
        <h2>Thêm Locket của bạn</h2>
        <p>Dán link Locket để hệ thống tự động lấy avatar và tên</p>
      </div>

      <div className="ali-form">
        <label className="ali-label">
          Link Locket <span className="ali-required">*</span>
        </label>
        <div className="ali-input-wrap">
          <span className="ali-icon">🔗</span>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="https://locket.cam/username"
            className="ali-input"
            disabled={checking || saving}
          />
        </div>

        {error && <div className="ali-error">⚠️ {error}</div>}
        {saved && <div className="ali-success">✅ Đã lưu Locket thành công!</div>}

        {!profile && (
          <button
            onClick={handleCheck}
            disabled={checking || !link.trim()}
            className="ali-btn ali-btn-check"
          >
            {checking ? "Đang kiểm tra..." : "Kiểm tra link"}
          </button>
        )}

        {profile && profile.valid && (
          <div className="ali-preview">
            <div className="ali-preview-label">✅ Locket hợp lệ</div>
            <div className="ali-preview-info">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=7c3aed&color=fff`}
                alt={profile.username}
                className="ali-avatar"
              />
              <div>
                <div className="ali-name">{profile.displayName || profile.username}</div>
                <div className="ali-username">@{profile.username}</div>
              </div>
            </div>

            <div className="ali-actions">
              <button onClick={handleSave} disabled={saving} className="ali-btn ali-btn-save">
                {saving ? "Đang lưu..." : "Lưu Locket"}
              </button>
              <button
                onClick={() => { setProfile(null); setLink(""); }}
                className="ali-btn ali-btn-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="ali-note">
          🔒 Chúng tôi không cần mật khẩu, chỉ cần link công khai
        </div>
      </div>
    </div>
  );
}
