"use client";

import { useEffect, useState } from "react";

export default function AdminHeader() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin_theme") || "dark";
    setMode(saved as "dark" | "light");
    applyTheme(saved as "dark" | "light");
  }, []);

  const applyTheme = (m: "dark" | "light") => {
    if (m === "light") {
      document.body.setAttribute("data-mode", "light");
    } else {
      document.body.removeAttribute("data-mode");
    }
  };

  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("admin_theme", newMode);
    applyTheme(newMode);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h2 className="admin-header-title">Quản trị Locket Gold</h2>
      </div>

      <div className="admin-header-right">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="admin-header-btn"
          title={mode === "dark" ? "Chuyển sáng" : "Chuyển tối"}
        >
          {mode === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Notification */}
        <button className="admin-header-btn" title="Thông báo">
          🔔
        </button>

        {/* User */}
        <div className="admin-header-user">
          <div className="admin-header-avatar">A</div>
          <div className="admin-header-info">
            <div className="admin-header-name">Admin</div>
            <div className="admin-header-role">Quản trị viên</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 24px;
          background: rgba(18, 18, 32, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(167, 139, 250, 0.12);
          border-radius: 16px;
          margin-bottom: 24px;
          position: sticky;
          top: 16px;
          z-index: 50;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        body[data-mode="light"] .admin-header {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(124, 58, 237, 0.1);
        }

        .admin-header-left { flex: 1; min-width: 0; }

        .admin-header-title {
          font-size: 16px;
          font-weight: 800;
          color: #f5f5ff;
          letter-spacing: -0.3px;
        }
        body[data-mode="light"] .admin-header-title {
          color: #1a1a2e;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-header-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.2);
          color: #f5f5ff;
          font-size: 18px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
          font-family: inherit;
        }
        .admin-header-btn:hover {
          background: rgba(167, 139, 250, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(167, 139, 250, 0.3);
        }
        body[data-mode="light"] .admin-header-btn {
          background: rgba(124, 58, 237, 0.06);
          border-color: rgba(124, 58, 237, 0.15);
          color: #4a4a6a;
        }

        .admin-header-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s;
        }
        .admin-header-user:hover {
          background: rgba(167, 139, 250, 0.2);
        }
        body[data-mode="light"] .admin-header-user {
          background: rgba(124, 58, 237, 0.06);
          border-color: rgba(124, 58, 237, 0.15);
        }

        .admin-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .admin-header-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .admin-header-name {
          font-size: 13px;
          font-weight: 800;
          color: #f5f5ff;
          line-height: 1.2;
        }
        body[data-mode="light"] .admin-header-name {
          color: #1a1a2e;
        }

        .admin-header-role {
          font-size: 10.5px;
          color: #8b88a8;
          line-height: 1.2;
        }

        @media (max-width: 640px) {
          .admin-header {
            padding: 12px 16px;
            border-radius: 12px;
            top: 8px;
          }
          .admin-header-title { display: none; }
          .admin-header-info { display: none; }
          .admin-header-user { padding: 6px; }
        }
      `}</style>
    </header>
  );
}
