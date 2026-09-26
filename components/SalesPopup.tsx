"use client";

import { useEffect, useRef, useState } from "react";
import { realSales, type SaleItem } from "@/lib/data";

export default function SalesPopup() {
  const [sale, setSale] = useState<SaleItem | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const hoveredRef = useRef(false);
  const popupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    let loopTimer: ReturnType<typeof setTimeout> | null = null;

    const showRandom = () => {
      if (!mounted) return;
      const s = realSales[indexRef.current % realSales.length];
      indexRef.current++;
      setSale(s);
      setVisible(true);
      popupRef.current = setTimeout(() => {
        if (!hoveredRef.current) setVisible(false);
      }, 6000);
      loopTimer = setTimeout(showRandom, 60000);
    };

    const t = setTimeout(showRandom, 3000);
    return () => {
      mounted = false;
      clearTimeout(t);
      if (loopTimer) clearTimeout(loopTimer);
      if (popupRef.current) clearTimeout(popupRef.current);
    };
  }, []);

  if (!sale) return null;

  return (
    <div
      className={`sales-popup${!visible ? " hide" : ""}`}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <div className="sales-popup-img">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="sales-popup-content">
        <div className="sales-title">
          <span>{sale.name}</span> vừa đăng ký gói
        </div>
        <div className="sales-desc">{sale.plan}</div>
        <div className="sales-time">{sale.time}</div>
      </div>
      <div className="sales-close" onClick={() => setVisible(false)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>
  );
}
