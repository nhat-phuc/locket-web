"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <Link href="/dns-la-gi">DNS là gì?</Link>
          <span className="footer-dot">•</span>
          <Link href="/chinh-sach-bao-hanh">Chính sách Bảo hành</Link>
          <span className="footer-dot">•</span>
          <Link href="/dieu-khoan-su-dung">Điều khoản Sử dụng</Link>
          <span className="footer-dot">•</span>
          <Link href="/chinh-sach-bao-mat">Chính sách Bảo mật</Link>
        </div>
        <div className="footer-copy">
          © 2026 <strong>Locket Gold</strong> — locketgold.app. Được phát triển bởi{" "}
          <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer">
            Phúc Nexus
          </a>
        </div>
      </div>

      <style jsx>{`
        .footer {
          padding: 40px 20px 100px;
          text-align: center;
          border-top: 1px solid var(--border);
          margin-top: 60px;
        }
        .footer-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer-links :global(a) {
          color: var(--text-1);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .footer-links :global(a:hover) {
          color: var(--accent-bright);
        }
        .footer-dot {
          color: var(--text-2);
          font-size: 12px;
          opacity: 0.5;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--text-2);
          line-height: 1.7;
          padding: 0 8px;
        }
        .footer-copy :global(strong) {
          color: var(--text-0);
          font-weight: 800;
        }
        .footer-copy :global(a) {
          color: var(--accent-bright);
          text-decoration: underline;
          font-weight: 600;
        }
        .footer-copy :global(a:hover) {
          color: var(--accent);
        }

        /* Mobile */
        @media (max-width: 640px) {
          .footer {
            padding: 32px 16px 90px;
            margin-top: 40px;
          }
          .footer-links {
            flex-direction: row;      /* 👈 Giữ xếp ngang */
            flex-wrap: wrap;          /* 👈 Tự xuống dòng */
            gap: 8px 10px;
            font-size: 13px;
            margin-bottom: 16px;
          }
          .footer-dot {
            display: inline;          /* 👈 Vẫn hiện dấu • */
            font-size: 11px;
          }
          .footer-copy {
            font-size: 12px;
            line-height: 1.6;
          }
        }

        /* Mobile rất nhỏ */
        @media (max-width: 360px) {
          .footer-links {
            font-size: 12px;
            gap: 6px 8px;
          }
        }
      `}</style>
    </footer>
  );
}
