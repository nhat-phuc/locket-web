"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError("Nhập tên, email hoặc SĐT");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setIdentifier("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-wrap">
      <div className="fp-header">
        <div className="fp-icon">🔑</div>
        <h3 className="fp-title">Quên mật khẩu?</h3>
        <p className="fp-sub">
          Nhập tên, email hoặc SĐT để nhận link đặt lại mật khẩu
        </p>
      </div>

      <div className="fp-form">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Tên / Email / SĐT"
          className="fp-input"
          disabled={loading}
        />

        {error && <div className="fp-error">⚠️ {error}</div>}
        {message && <div className="fp-success">✅ {message}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !identifier.trim()}
          className="fp-btn"
        >
          {loading ? "Đang gửi..." : "Gửi link reset"}
        </button>
      </div>

      <style jsx>{`
        .fp-wrap {
          padding: 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167, 139, 250, 0.2);
        }
        .fp-header {
          text-align: center;
          margin-bottom: 18px;
        }
        .fp-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .fp-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-0);
          margin: 0 0 4px;
        }
        .fp-sub {
          font-size: 12px;
          color: var(--text-2);
          margin: 0;
          line-height: 1.4;
        }
        .fp-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .fp-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          color: var(--text-0);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .fp-input:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
        }
        .fp-error {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 12px;
          font-weight: 600;
        }
        .fp-success {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(34, 197, 94, 0.08);
          color: #22c55e;
          font-size: 12px;
          font-weight: 600;
        }
        .fp-btn {
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.25);
        }
        .fp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.35);
        }
        .fp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
