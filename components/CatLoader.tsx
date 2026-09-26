"use client";

import { useEffect, useRef, useState } from "react";

export default function CatLoader() {
  const [visible, setVisible] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const logo = logoRef.current;
    if (!loader || !logo) return;

    const onMove = (e: MouseEvent) => {
      const rect = loader.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const ax = -(y / (rect.height / 2)) * 25;
      const ay = (x / (rect.width / 2)) * 25;
      logo.style.transform = `rotateX(${ax}deg) rotateY(${ay}deg) scale(1.1)`;
      logo.style.filter = `drop-shadow(${-ay * 0.8}px ${ax * 0.8 + 15}px 30px rgba(167,139,250,0.6))`;
    };
    const onLeave = () => {
      logo.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
      logo.style.filter = "drop-shadow(0 12px 24px rgba(167,139,250,0.45))";
    };
    loader.addEventListener("mousemove", onMove, { passive: true });
    loader.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      loader.removeEventListener("mousemove", onMove);
      loader.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div id="lk-cat-loader" ref={loaderRef}>
      <div className="lk-logo-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={logoRef} src="/img/logo/logo.jpg" className="lk-cat-logo" alt="Loading" />
      </div>
      <div className="lk-cat-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="lk-cat-text">Đang tải Locket Gold...</div>
    </div>
  );
}
