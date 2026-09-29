"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Danh sách path KHÔNG hiển thị BottomNav
const HIDDEN_PATHS = [
  "/admin",
  "/dang-nhap",
  "/dang-ky",
  "/quen-mat-khau",
  "/dat-lai-mat-khau",
  "/kich-hoat",   // có thể ẩn nếu muốn
];

const items = [
  {
    href: "/",
    label: "Trang chủ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/bang-gia",
    label: "Bảng Giá VIP",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    href: "/kich-hoat",
    label: "Kích Hoạt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: "/huong-dan",
    label: "Hướng dẫn",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    href: "/tai-khoan",
    label: "Tài khoản",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Ẩn BottomNav ở các trang admin, auth
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="bottom-nav">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${active ? "is-active" : ""}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: stretch;
          }
          :global(body) {
            padding-bottom: 76px;
          }
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 6px 4px;
          text-decoration: none;
          color: #9ca3af;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border-radius: 10px;
        }

        .bottom-nav-icon {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bottom-nav-icon :global(svg) {
          width: 22px;
          height: 22px;
          stroke-width: 2;
          transition: all 0.25s ease;
        }

        .bottom-nav-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1px;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .bottom-nav-item.is-active {
          color: #a855f7;
        }

        .bottom-nav-item.is-active .bottom-nav-icon {
          transform: translateY(-2px) scale(1.1);
        }

        .bottom-nav-item.is-active .bottom-nav-icon :global(svg) {
          stroke: #a855f7;
          filter: drop-shadow(0 2px 6px rgba(168, 85, 247, 0.4));
        }

        .bottom-nav-item.is-active .bottom-nav-label {
          color: #a855f7;
          font-weight: 800;
        }

        .bottom-nav-item.is-active::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          border-radius: 0 0 3px 3px;
          animation: navIndicator 0.3s ease;
        }

        @keyframes navIndicator {
          from { width: 0; opacity: 0; }
          to { width: 20px; opacity: 1; }
        }

        .bottom-nav-item:active {
          transform: scale(0.92);
        }
      `}</style>
    </>
  );
}
