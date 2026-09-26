"use client";

import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* ============ ADMIN LAYOUT ============ */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-0, #0a0a14);
          position: relative;
        }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 32px;
          min-height: 100vh;
          animation: adminFadeIn .5s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes adminFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .admin-main { margin-left: 0; padding: 80px 16px 32px; }
        }

        /* ============ SIDEBAR ============ */
        .admin-sidebar {
          width: 260px;
          background: linear-gradient(180deg, rgba(18,18,32,.98), rgba(12,12,22,.98));
          border-right: 1px solid rgba(167,139,250,.12);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          backdrop-filter: blur(20px);
          transition: transform .3s cubic-bezier(.2,.7,.2,1);
        }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 0 0 60px rgba(0,0,0,.6); }
        }

        .admin-sidebar-header {
          padding: 20px 18px;
          border-bottom: 1px solid rgba(167,139,250,.12);
        }
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 8px;
          border-radius: 12px;
          transition: background .25s;
        }
        .admin-logo:hover { background: rgba(167,139,250,.08); }
        .admin-logo img {
          width: 40px; height: 40px;
          border-radius: 12px;
          object-fit: contain;
          box-shadow: 0 6px 18px rgba(167,139,250,.35);
        }
        .admin-logo-title {
          font-size: 15px;
          font-weight: 900;
          color: #f5f5ff;
          letter-spacing: -.3px;
        }
        .admin-logo-sub {
          font-size: 11px;
          color: #8b88a8;
          letter-spacing: .3px;
        }

        /* ============ NAV ============ */
        .admin-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          scrollbar-width: thin;
        }
        .admin-nav::-webkit-scrollbar { width: 6px; }
        .admin-nav::-webkit-scrollbar-thumb {
          background: rgba(167,139,250,.2);
          border-radius: 3px;
        }

        .admin-nav-group { margin-bottom: 20px; }
        .admin-nav-group-title {
          font-size: 10.5px;
          font-weight: 800;
          color: #6b6885;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 0 12px 8px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          color: #c7c5db;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          transition: all .25s cubic-bezier(.2,.7,.2,1);
          position: relative;
          margin-bottom: 2px;
          animation: navSlideIn .4s cubic-bezier(.2,.7,.2,1) both;
        }
        @keyframes navSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .admin-nav-item:hover {
          background: rgba(167,139,250,.1);
          color: #f5f5ff;
          transform: translateX(3px);
        }
        .admin-nav-item.active {
          background: linear-gradient(135deg, rgba(167,139,250,.22), rgba(124,58,237,.15));
          color: #f5f5ff;
          box-shadow: 0 4px 16px rgba(124,58,237,.25);
          border: 1px solid rgba(167,139,250,.3);
        }
        .admin-nav-icon {
          font-size: 17px;
          width: 22px;
          text-align: center;
          filter: drop-shadow(0 0 4px rgba(167,139,250,.3));
        }
        .admin-nav-label { flex: 1; }
        .admin-nav-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 8px #a78bfa;
          animation: dotPulse 2s infinite;
        }
        @keyframes dotPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: .6; transform: scale(1.3); }
        }

        .admin-sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(167,139,250,.12);
        }

        /* ============ MOBILE ============ */
        .admin-mobile-toggle {
          position: fixed;
          top: 16px;
          left: 16px;
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(18,18,32,.95);
          border: 1px solid rgba(167,139,250,.3);
          color: #f5f5ff;
          font-size: 20px;
          cursor: pointer;
          z-index: 200;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 24px rgba(0,0,0,.4);
        }
        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.6);
          backdrop-filter: blur(4px);
          z-index: 99;
          animation: fadeIn .25s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ============ LIGHT MODE ============ */
        body[data-mode="light"] .admin-sidebar {
          background: linear-gradient(180deg, #ffffff, #f7f5ff);
          border-right-color: rgba(124,58,237,.1);
        }
        body[data-mode="light"] .admin-logo-title { color: #1a1a2e; }
        body[data-mode="light"] .admin-logo-sub { color: #7a7a9a; }
        body[data-mode="light"] .admin-nav-item { color: #4a4a6a; }
        body[data-mode="light"] .admin-nav-item:hover {
          background: rgba(124,58,237,.08);
          color: #1a1a2e;
        }
        body[data-mode="light"] .admin-nav-item.active {
          background: linear-gradient(135deg, rgba(124,58,237,.15), rgba(167,139,250,.1));
          color: #1a1a2e;
        }
        body[data-mode="light"] .admin-main { background: #f7f5ff; }
      `}</style>

      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
