"use client";

import { useEffect, useRef, useState } from "react";

interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  coverImage: string | null;
  badge: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string | null;
  profileUrl: string | null;
  createdAt: string;
}

const BADGES = [
  { id: "star", icon: "⭐", label: "Ngôi sao", color: "#fbbf24" },
  { id: "crown", icon: "👑", label: "Vua", color: "#f59e0b" },
  { id: "diamond", icon: "💎", label: "Kim cương", color: "#60a5fa" },
  { id: "fire", icon: "🔥", label: "Hot", color: "#ef4444" },
  { id: "heart", icon: "💖", label: "Tim", color: "#ec4899" },
  { id: "rocket", icon: "🚀", label: "Rocket", color: "#a78bfa" },
  { id: "trophy", icon: "🏆", label: "Cúp", color: "#fbbf24" },
  { id: "verified", icon: "✅", label: "Xác thực", color: "#10b981" },
];

const INTERESTS = [
  { id: "travel", label: "Du lịch", icon: "✈️" },
  { id: "sport", label: "Thể thao", icon: "🏃" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "music", label: "Âm nhạc", icon: "🎵" },
  { id: "food", label: "Ẩm thực", icon: "🍔" },
  { id: "tech", label: "Công nghệ", icon: "💻" },
  { id: "book", label: "Đọc sách", icon: "📚" },
  { id: "art", label: "Chụp ảnh", icon: "📷" },
];

export default function AddLocketPage() {
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState<{ username: string; avatar: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfiles = () => {
    setLoading(true);
    fetch(`/api/locket/list?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProfiles(d.profiles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfiles(); }, [search]);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 2) {
      setPreview(null);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locket/check?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.valid) setPreview({ username: data.username, avatar: data.avatar });
        else setPreview(null);
      } catch {
        setPreview(null);
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [input]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/cover", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
        showToast("success", "✓ Đã upload ảnh bìa");
      } else {
        showToast("error", data.error || "Upload thất bại");
      }
    } catch {
      showToast("error", "Lỗi upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);

    try {
      const res = await fetch("/api/locket/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: preview.username,
          avatar: preview.avatar,
          displayName: displayName || null,
          age: age ? Number(age) : null,
          gender,
          interests: selectedInterests,
          coverImage: coverImage || null,
          badge: selectedBadge || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "✅ Đã lưu profile!");
        setInput("");
        setPreview(null);
        setDisplayName("");
        setAge("");
        setSelectedInterests([]);
        setCoverImage("");
        setSelectedBadge("");
        loadProfiles();
      } else {
        showToast("error", data.message || "Lưu thất bại");
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa profile này?")) return;
    try {
      await fetch(`/api/locket/list?id=${id}`, { method: "DELETE" });
      showToast("success", "🗑 Đã xóa");
      loadProfiles();
    } catch {
      showToast("error", "Xóa thất bại");
    }
  };

  const parseInterests = (p: Profile): string[] => {
    if (!p.interests) return [];
    try { return JSON.parse(p.interests); } catch { return []; }
  };

  const getBadge = (id: string | null) => {
    if (!id) return null;
    return BADGES.find((b) => b.id === id) || null;
  };

  return (
    <main className="al-page">
      <div className="al-grid-bg" />

      <div className="al-wrap">
        <div className="al-hero">
          <div className="al-badge">
            <span className="al-badge-dot" />
            Add Locket 3 Miền
          </div>
          <h1 className="al-h1">
            🔗 Add <span className="al-grad">Locket</span>
          </h1>
          <p className="al-sub">
            Nhập link hoặc username Locket để lưu vào danh sách
          </p>
        </div>

        {toast && (
          <div className={`al-toast ${toast.type === "success" ? "is-ok" : "is-err"}`}>
            {toast.msg}
          </div>
        )}

        <div className="al-card">
          <label className="al-label">Link hoặc Username Locket</label>
          <div className="al-input-wrap">
            <span className="al-input-icon">@</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://locket.cam/username hoặc username"
              className={`al-input ${preview ? "is-valid" : ""}`}
            />
            {checking && <div className="al-spin" />}
            {!checking && preview && <span className="al-check">✓</span>}
          </div>

          {preview && (
            <div className="al-preview">
              <div className="al-preview-header">
                {preview.avatar ? (
                  <img src={preview.avatar} alt={preview.username} className="al-preview-avatar" />
                ) : (
                  <div className="al-preview-avatar al-preview-fallback">
                    {preview.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="al-preview-name">@{preview.username}</div>
                  <div className="al-preview-status">✓ Đã tìm thấy trên Locket</div>
                </div>
              </div>

              <div className="al-field">
                <label className="al-label-sm">�� Ảnh bìa</label>
                {coverImage ? (
                  <div className="al-cover-preview">
                    <img src={coverImage} alt="cover" />
                    <button type="button" onClick={() => setCoverImage("")} className="al-cover-remove">✕</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="al-cover-btn"
                  >
                    {uploading ? "⏳ Đang upload..." : "📸 Chọn ảnh bìa (tối đa 5MB)"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  style={{ display: "none" }}
                />
              </div>

              <div className="al-field">
                <label className="al-label-sm">🏅 Huy hiệu</label>
                <div className="al-badges">
                  <button
                    type="button"
                    onClick={() => setSelectedBadge("")}
                    className={`al-badge-btn al-badge-none ${selectedBadge === "" ? "is-on" : ""}`}
                    style={{ "--badge-color": "#9ca3af" } as React.CSSProperties}
                  >
                    Không
                  </button>
                  {BADGES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBadge(b.id)}
                      className={`al-badge-btn ${selectedBadge === b.id ? "is-on" : ""}`}
                      style={{ "--badge-color": b.color } as React.CSSProperties}
                      title={b.label}
                    >
                      {b.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-form-grid">
                <div>
                  <label className="al-label-sm">Tên hiển thị</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="VD: Trần Quốc Vũ"
                    className="al-input-sm"
                  />
                </div>
                <div>
                  <label className="al-label-sm">Tuổi</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="VD: 18"
                    className="al-input-sm"
                  />
                </div>
                <div>
                  <label className="al-label-sm">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                    className="al-input-sm"
                  >
                    <option value="male">Nam ♂</option>
                    <option value="female">Nữ ♀</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="al-field">
                <label className="al-label-sm">Sở thích</label>
                <div className="al-interests">
                  {INTERESTS.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleInterest(i.id)}
                      className={`al-interest ${selectedInterests.includes(i.id) ? "is-on" : ""}`}
                    >
                      {i.icon} {i.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="al-btn">
                {saving ? "Đang lưu..." : "💾 Lưu vào danh sách"}
              </button>
            </div>
          )}
        </div>

        <div className="al-list-header">
          <h2 className="al-list-title">📋 Danh sách đã lưu ({profiles.length})</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm..."
            className="al-search"
          />
        </div>

        {loading && <div className="al-empty">Đang tải...</div>}

        {!loading && profiles.length === 0 && (
          <div className="al-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700 }}>Chưa có profile nào</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Nhập link Locket ở trên để bắt đầu</div>
          </div>
        )}

        {!loading && profiles.length > 0 && (
          <div className="al-grid">
            {profiles.map((p) => {
              const interests = parseInterests(p);
              const badge = getBadge(p.badge);
              return (
                <div key={p.id} className="al-card-profile">
                  {p.coverImage && (
                    <img src={p.coverImage} alt="cover" className="al-cover" />
                  )}

                  <div className="al-profile-content">
                    <div className="al-profile-avatar-wrap">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.username} className="al-profile-avatar" />
                      ) : (
                        <div className="al-profile-avatar al-profile-fallback">
                          {p.username[0].toUpperCase()}
                        </div>
                      )}
                      {p.gender === "male" && <span className="al-profile-badge is-male">♂</span>}
                      {p.gender === "female" && <span className="al-profile-badge is-female">♀</span>}
                      {badge && (
                        <span
                          className="al-profile-badge-icon"
                          style={{ background: badge.color }}
                          title={badge.label}
                        >
                          {badge.icon}
                        </span>
                      )}
                    </div>

                    <div className="al-profile-name">{p.displayName || `@${p.username}`}</div>

                    {p.age && (
                      <div className="al-profile-age">
                        <span>🇻🇳</span> {p.age}t
                      </div>
                    )}

                    {interests.length > 0 && (
                      <div className="al-profile-interests">
                        {interests.slice(0, 2).map((i) => {
                          const info = INTERESTS.find((x) => x.id === i);
                          if (!info) return null;
                          return (
                            <span key={i} className="al-profile-interest">
                              {info.icon} {info.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <a
                      href={p.profileUrl || `https://locket.cam/${p.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="al-profile-btn"
                    >
                      Open Locket →
                    </a>

                    <div className="al-profile-footer">
                      <button onClick={() => handleDelete(p.id)} className="al-profile-del">
                        🗑 Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .al-page {
          position: relative;
          min-height: 100vh;
          padding: 100px 20px 80px;
          background: var(--bg-0);
          overflow: hidden;
        }

        .al-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(167,139,250,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
          pointer-events: none;
          z-index: 0;
        }

        .al-wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }

        .al-hero { text-align: center; margin-bottom: 32px; }
        .al-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 999px;
          color: var(--accent);
          font-size: 12.5px; font-weight: 800;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .al-badge-dot {
          width: 7px; height: 7px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          animation: alPulse 2s ease-in-out infinite;
        }
        @keyframes alPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .al-h1 {
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 900;
          color: var(--text-0);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .al-grad {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .al-sub { font-size: 14.5px; color: var(--text-2); margin-bottom: 24px; }

        .al-toast {
          max-width: 600px; margin: 0 auto 20px;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13.5px; font-weight: 600;
          text-align: center;
          animation: alFadeIn 0.3s ease;
        }
        .al-toast.is-ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .al-toast.is-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }

        .al-card {
          max-width: 700px; margin: 0 auto 40px;
          padding: 24px;
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }

        .al-label { display: block; font-size: 13px; font-weight: 700; color: var(--text-1); margin-bottom: 10px; }
        .al-label-sm { display: block; font-size: 12px; font-weight: 700; color: var(--text-2); margin-bottom: 8px; }

        .al-input-wrap { position: relative; }
        .al-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-2); font-weight: 700; font-size: 15px; }
        .al-input {
          width: 100%; padding: 15px 44px 15px 40px;
          background: var(--bg-2);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          color: var(--text-0);
          font-size: 14.5px; font-family: inherit;
          outline: none; transition: all 0.25s;
          box-sizing: border-box;
        }
        .al-input:focus { border-color: var(--accent); background: var(--bg-1); box-shadow: 0 0 0 4px rgba(167,139,250,0.12); }
        .al-input.is-valid { border-color: #10b981; background: rgba(16,185,129,0.05); }

        .al-spin {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          width: 18px; height: 18px;
          border: 2px solid rgba(167,139,250,0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: alSpin 0.6s linear infinite;
        }
        @keyframes alSpin { to { transform: translateY(-50%) rotate(360deg); } }
        .al-check { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 18px; font-weight: 900; }

        .al-preview {
          margin-top: 20px;
          padding: 20px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          animation: alFadeIn 0.3s ease;
        }
        @keyframes alFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .al-preview-header { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px dashed var(--border); }
        .al-preview-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2.5px solid #10b981; }
        .al-preview-fallback { display: grid; place-items: center; background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff; font-weight: 900; font-size: 22px; }
        .al-preview-name { font-size: 16px; font-weight: 900; color: #10b981; margin-bottom: 4px; }
        .al-preview-status { font-size: 12px; color: #10b981; font-weight: 700; }

        .al-field { margin-bottom: 18px; }

        .al-cover-btn {
          width: 100%; padding: 14px 20px;
          background: var(--bg-1);
          border: 1.5px dashed var(--border);
          border-radius: 12px;
          color: var(--text-2);
          font-size: 13.5px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: all 0.25s;
        }
        .al-cover-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(167,139,250,0.04); }
        .al-cover-preview { position: relative; width: 100%; height: 130px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
        .al-cover-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .al-cover-remove {
          position: absolute; top: 8px; right: 8px;
          width: 30px; height: 30px;
          background: rgba(0,0,0,0.75); color: #fff;
          border: none; border-radius: 50%;
          cursor: pointer; font-size: 14px;
        }
        .al-cover-remove:hover { background: #ef4444; }

        .al-badges { display: flex; flex-wrap: wrap; gap: 8px; }
        .al-badge-btn {
          min-width: 46px; height: 46px;
          display: grid; place-items: center;
          background: var(--bg-1);
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: 20px; cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
          color: var(--text-2);
          padding: 0 8px;
        }
        .al-badge-none { font-size: 12px; font-weight: 700; padding: 0 14px; }
        .al-badge-btn:hover { border-color: var(--badge-color); transform: translateY(-2px); }
        .al-badge-btn.is-on {
          background: var(--badge-color);
          border-color: var(--badge-color);
          color: #fff;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .al-form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; margin-bottom: 18px; }
        @media (max-width: 600px) { .al-form-grid { grid-template-columns: 1fr; } }

        .al-input-sm {
          width: 100%; padding: 12px 14px;
          background: var(--bg-1);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          color: var(--text-0);
          font-size: 14px; font-family: inherit;
          outline: none; box-sizing: border-box;
        }
        .al-input-sm:focus { border-color: var(--accent); }

        .al-interests { display: flex; flex-wrap: wrap; gap: 8px; }
        .al-interest {
          padding: 9px 14px;
          background: var(--bg-1);
          border: 1.5px solid var(--border);
          border-radius: 999px;
          color: var(--text-2);
          font-size: 13px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: all 0.25s;
        }
        .al-interest:hover { border-color: rgba(167,139,250,0.5); color: var(--accent); }
        .al-interest.is-on {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          color: #fff; border-color: transparent;
          box-shadow: 0 6px 18px rgba(167,139,250,0.4);
        }

        .al-btn {
          width: 100%;
          padding: 15px 24px;
          margin-top: 12px;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 800;
          font-family: inherit; cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 12px 32px rgba(167,139,250,0.4);
        }
        .al-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 44px rgba(167,139,250,0.55); }
        .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .al-list-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .al-list-title { font-size: 18px; font-weight: 900; color: var(--text-0); }
        .al-search {
          padding: 11px 16px;
          background: var(--bg-1);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          color: var(--text-0);
          font-size: 13.5px; font-family: inherit;
          outline: none; min-width: 220px;
        }
        .al-search:focus { border-color: var(--accent); }

        .al-empty {
          text-align: center; padding: 60px 20px;
          color: var(--text-2); font-size: 15px;
          background: var(--bg-1);
          border: 1px dashed var(--border);
          border-radius: 20px;
        }

        .al-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

        .al-card-profile {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .al-card-profile:hover { transform: translateY(-6px); border-color: var(--accent); box-shadow: 0 24px 60px rgba(167,139,250,0.25); }

        .al-cover { width: 100%; height: 110px; object-fit: cover; display: block; }
        .al-profile-content { padding: 16px; position: relative; }
        .al-card-profile .al-cover + .al-profile-content .al-profile-avatar-wrap { margin-top: -56px; }

        .al-profile-avatar-wrap {
          position: relative;
          width: 84px; height: 84px;
          margin: 0 auto 14px;
          padding: 3px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #a78bfa, #ec4899, #a78bfa);
          animation: alSpin360 6s linear infinite;
        }
        @keyframes alSpin360 { to { transform: rotate(360deg); } }
        .al-profile-avatar-wrap > * { animation: alSpin360Back 6s linear infinite; }
        @keyframes alSpin360Back { to { transform: rotate(-360deg); } }

        .al-profile-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--bg-1); background: var(--bg-1); }
        .al-profile-fallback { display: grid; place-items: center; background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff; font-weight: 900; font-size: 28px; }
        .al-profile-badge {
          position: absolute; bottom: 0; right: 0;
          width: 26px; height: 26px;
          display: grid; place-items: center;
          color: #fff; font-size: 13px; font-weight: 900;
          border-radius: 50%;
          border: 2px solid var(--bg-1);
          z-index: 2;
        }
        .al-profile-badge.is-male { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .al-profile-badge.is-female { background: linear-gradient(135deg, #ec4899, #db2777); }
        .al-profile-badge-icon {
          position: absolute; top: 0; right: 0;
          width: 28px; height: 28px;
          display: grid; place-items: center;
          color: #fff; font-size: 14px;
          border-radius: 50%;
          border: 2px solid var(--bg-1);
          z-index: 3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: alBadgePulse 2s ease-in-out infinite;
        }
        @keyframes alBadgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        .al-profile-name { font-size: 15px; font-weight: 900; color: var(--text-0); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .al-profile-age { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--text-2); margin-bottom: 10px; }
        .al-profile-interests { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 14px; min-height: 28px; }
        .al-profile-interest { padding: 4px 10px; background: rgba(167, 139, 250, 0.1); border: 1px solid rgba(167, 139, 250, 0.25); border-radius: 999px; color: var(--accent); font-size: 11px; font-weight: 700; white-space: nowrap; }

        .al-profile-btn {
          display: block; padding: 11px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff; text-decoration: none;
          border-radius: 12px;
          font-size: 13.5px; font-weight: 800;
          box-shadow: 0 8px 20px rgba(167,139,250,0.35);
          transition: all 0.3s;
        }
        .al-profile-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(167,139,250,0.5); }

        .al-profile-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: center; }
        .al-profile-del {
          background: none; border: none;
          color: #ef4444; font-size: 12px; font-weight: 700;
          cursor: pointer; padding: 4px 10px;
          border-radius: 8px; font-family: inherit;
        }
        .al-profile-del:hover { background: rgba(239,68,68,0.1); }

        @media (max-width: 500px) {
          .al-page { padding: 90px 12px 80px; }
          .al-card { padding: 18px; }
          .al-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .al-card-profile { padding: 14px 10px; }
          .al-profile-avatar-wrap { width: 64px; height: 64px; }
          .al-profile-name { font-size: 13px; }
          .al-profile-btn { font-size: 12px; padding: 9px; }
          .al-cover { height: 80px; }
        }
      `}</style>
    </main>
  );
}
