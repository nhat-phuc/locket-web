"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FloatingWidgets() {
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [zaloPopupOpen, setZaloPopupOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setBackToTopVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const zaloWrap = (e.target as HTMLElement).closest(".floating-zalo");
      if (!zaloWrap) setZaloPopupOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <div
        id="backToTop"
        className={`floating-widget${backToTopVisible ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        title="Lên đầu trang"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </div>

      <div className="floating-widget floating-zalo">
        <div className={`zalo-popup${zaloPopupOpen ? " show" : ""}`}>
          <a
            href="http://zalo.me/84344421026"
            target="_blank"
            rel="noopener noreferrer"
            className="zalo-popup-item"
            style={{ color: "#0068ff" }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 12,
                padding: "2px 5px",
                borderRadius: 4,
                background: "#0068ff",
                color: "#fff",
                lineHeight: 1,
              }}
            >
              Zalo
            </div>
            Nhóm Zalo Mới
          </a>
          <a
            href="https://t.me/hethonglocket"
            target="_blank"
            rel="noopener noreferrer"
            className="zalo-popup-item"
            style={{ color: "#229ED9" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ED9">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Nhóm TELE
          </a>
        </div>

        <Link
          href="/vong-quay"
          className="lucky-trigger"
          title="Vòng Quay May Mắn"
        >
          <div className="lucky-trigger-wheel" />
          <div className="lucky-trigger-center">SPIN</div>
        </Link>

        <div
          className="zalo-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setZaloPopupOpen((s) => !s);
          }}
          title="Hỗ trợ & Liên hệ"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo/icon.jpg"
            alt="Hỗ trợ"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "contain",
            }}
          />
          <span className="zalo-badge">Liên hệ</span>
        </div>
      </div>
    </>
  );
}
