"use client";

import { useState } from "react";

interface PreviewData {
  username: string;
  displayName: string | null;
  avatar: string | null;
  profileUrl: string;
}

interface Props {
  variant?: "hero" | "card";
  onContinue?: (data: PreviewData) => void;
}

export default function LocketPreview({ variant = "card", onContinue }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPreview(null);

    if (!input.trim() || input.trim().length < 2) {
      setError("Vui lòng nhập username hoặc link Locket");
      return;
    }

    setLoading(true);

    try {
      // 1. Check username tồn tại
      const res = await fetch(`/api/locket/check?username=${encodeURIComponent(input.trim())}`);
      const data = await res.json();

      if (!data.valid) {
        setError(data.message || "Username hoặc link bị sai. Vui lòng kiểm tra lại.");
        return;
      }

      // 2. Lấy avatar + tên từ HTML
      let displayName = data.username;
      let avatar = data.avatar;

      // Nếu chưa có avatar → fetch thêm từ save API để lấy
      if (!avatar) {
        try {
          const saveRes = await fetch("/api/locket/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: data.username }),
          });
          const saveData = await saveRes.json();
          if (saveData.success && saveData.profile) {
            avatar = saveData.profile.avatar;
            displayName = saveData.profile.displayName || data.username;
          }
        } catch {}
      }

      setPreview({
        username: data.username,
        displayName: displayName || data.username,
        avatar: avatar || null,
        profileUrl: `https://locket.cam/${data.username}`,
      });
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (preview && onContinue) {
      onContinue(preview);
    }
  };

  return (
    <div className={`locket-preview locket-preview-${variant}`}>
      {!preview ? (
        <form onSubmit={handleCheck} className="lp-form">
          <div className="lp-input-wrap">
            <span className="lp-input-icon">🔍</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập username hoặc link Locket..."
              className="lp-input"
              autoComplete="off"
              disabled={loading}
            />
            <button
              type="submit"
              className="lp-btn"
              disabled={loading || !input.trim()}
            >
              {loading ? "Đang kiểm tra..." : "Kiểm tra"}
            </button>
          </div>

          {error && <div className="lp-error">⚠️ {error}</div>}

          <div className="lp-hint">
            💡 VD: <code>phuc2001</code> hoặc <code>https://locket.cam/phuc2001</code>
          </div>
        </form>
      ) : (
        <div className="lp-result">
          <div className="lp-profile">
            <div className="lp-avatar-wrap">
              {preview.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.avatar}
                  alt={preview.displayName || preview.username}
                  referrerPolicy="no-referrer"
                  className="lp-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector(".lp-avatar-fallback")) {
                      const div = document.createElement("div");
                      div.className = "lp-avatar-fallback";
                      div.textContent = (preview.displayName || preview.username).charAt(0).toUpperCase();
                      parent.appendChild(div);
                    }
                  }}
                />
              ) : (
                <div className="lp-avatar-fallback">
                  {(preview.displayName || preview.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="lp-info">
              <div className="lp-name">
                {preview.displayName || preview.username}
              </div>
              <div className="lp-username">
                @{preview.username}
              </div>
              <a
                href={preview.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-link"
              >
                🔗 Xem profile Locket
              </a>
            </div>

            <div className="lp-badge">✓ Đã xác minh</div>
          </div>

          <div className="lp-actions">
            <button
              type="button"
              onClick={() => { setPreview(null); setInput(""); }}
              className="lp-btn-ghost"
            >
              ← Nhập lại
            </button>

            {onContinue && (
              <button
                type="button"
                onClick={handleContinue}
                className="lp-btn-primary"
              >
                🚀 Tiếp tục
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .locket-preview {
          width: 100%;
        }

        .locket-preview-card {
          max-width: 500px;
          margin: 0 auto;
        }

        /* FORM */
        .lp-form {
          width: 100%;
        }

        .lp-input-wrap {
          display: flex;
          gap: 8px;
          padding: 6px;
          background: var(--bg-1, #fff);
          border: 2px solid rgba(167, 139, 250, 0.3);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(167, 139, 250, 0.15);
          transition: all 0.25s;
        }

        .lp-input-wrap:focus-within {
          border-color: #a78bfa;
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.25);
        }

        .lp-input-icon {
          display: flex;
          align-items: center;
          padding-left: 14px;
          font-size: 18px;
          flex-shrink: 0;
        }

        .lp-input {
          flex: 1;
          min-width: 0;
          padding: 14px 6px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 15px;
          font-family: inherit;
          font-weight: 600;
          color: var(--text-0, #111827);
        }

        .lp-input::placeholder {
          color: var(--text-2, #9ca3af);
          font-weight: 500;
        }

        .lp-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        .lp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
        }

        .lp-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .lp-error {
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #dc2626;
          font-size: 13.5px;
          font-weight: 600;
        }

        .lp-hint {
          margin-top: 12px;
          font-size: 12.5px;
          color: var(--text-2, #6b7280);
          text-align: center;
        }

        .lp-hint code {
          background: rgba(167, 139, 250, 0.1);
          color: #7c3aed;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: ui-monospace, monospace;
          font-weight: 700;
        }

        /* RESULT */
        .lp-result {
          padding: 20px;
          background: var(--bg-1, #fff);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.1);
          animation: lpPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes lpPop {
          0% { opacity: 0; transform: scale(0.95) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .lp-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(16, 185, 129, 0.05));
          border-radius: 16px;
          position: relative;
        }

        .lp-avatar-wrap {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border-radius: 50%;
          padding: 3px;
          background: conic-gradient(from 0deg, #a78bfa, #ec4899, #f59e0b, #10b981, #a78bfa);
          position: relative;
        }

        .lp-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 3px solid var(--bg-1, #fff);
        }

        .lp-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 900;
          border: 3px solid var(--bg-1, #fff);
        }

        .lp-info {
          flex: 1;
          min-width: 0;
        }

        .lp-name {
          font-size: 18px;
          font-weight: 900;
          color: var(--text-0, #111827);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lp-username {
          font-size: 13.5px;
          color: var(--text-2, #6b7280);
          font-family: ui-monospace, monospace;
          margin-bottom: 8px;
        }

        .lp-link {
          display: inline-block;
          font-size: 12.5px;
          color: #7c3aed;
          text-decoration: none;
          font-weight: 700;
        }

        .lp-link:hover {
          text-decoration: underline;
        }

        .lp-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
        }

        .lp-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .lp-btn-ghost {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 12px;
          color: var(--text-2, #6b7280);
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lp-btn-ghost:hover {
          background: var(--bg-2, #f9fafb);
          color: var(--text-0, #111827);
        }

        .lp-btn-primary {
          flex: 2;
          padding: 12px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }

        .lp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.4);
        }

        @media (max-width: 480px) {
          .lp-input-wrap {
            flex-direction: column;
            padding: 10px;
            gap: 10px;
          }
          .lp-input-icon {
            display: none;
          }
          .lp-input {
            padding: 10px 12px;
            background: var(--bg-2, #f9fafb);
            border-radius: 10px;
          }
          .lp-btn {
            width: 100%;
            padding: 13px;
          }
          .lp-avatar-wrap {
            width: 60px;
            height: 60px;
          }
          .lp-name { font-size: 16px; }
          .lp-badge { position: static; margin-top: 8px; display: inline-block; }
        }
      `}</style>
    </div>
  );
}
