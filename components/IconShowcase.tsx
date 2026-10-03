"use client";

import { useEffect, useRef } from "react";

const icons = [
  { x: 4, y: 15, xm: 6, ym: 6, size: 64, sizem: 54, theme: "gold" },
  { x: 4, y: 45, xm: 8, ym: 16, size: 56, sizem: 48, theme: "purple" },
  { x: 4, y: 75, xm: 5, ym: 27, size: 60, sizem: 52, theme: "pink" },
  { x: 11, y: 25, xm: 9, ym: 37, size: 58, sizem: 50, theme: "blue" },
  { x: 11, y: 55, xm: 6, ym: 48, size: 62, sizem: 52, theme: "green" },
  { x: 18, y: 12, xm: 8, ym: 59, size: 54, sizem: 46, theme: "gold" },
  { x: 18, y: 38, xm: 5, ym: 70, size: 58, sizem: 50, theme: "purple" },
  { x: 18, y: 68, xm: 9, ym: 81, size: 64, sizem: 54, theme: "pink" },
  { x: 25, y: 28, xm: 7, ym: 92, size: 52, sizem: 46, theme: "blue" },
  { x: 25, y: 58, xm: 24, ym: 10, size: 60, sizem: 52, theme: "green" },
  { x: 32, y: 15, xm: 27, ym: 21, size: 56, sizem: 48, theme: "gold" },
  { x: 32, y: 45, xm: 23, ym: 32, size: 54, sizem: 50, theme: "purple" },
  { x: 32, y: 75, xm: 26, ym: 43, size: 62, sizem: 46, theme: "pink" },
  { x: 39, y: 25, xm: 24, ym: 57, size: 58, sizem: 52, theme: "blue" },
  { x: 39, y: 55, xm: 28, ym: 68, size: 56, sizem: 50, theme: "green" },
  { x: 43, y: 10, xm: 23, ym: 79, size: 64, sizem: 54, theme: "gold" },
  { x: 43, y: 78, xm: 26, ym: 90, size: 58, sizem: 50, theme: "purple" },
  { x: 92, y: 15, xm: 76, ym: 10, size: 64, sizem: 54, theme: "pink" },
  { x: 92, y: 45, xm: 73, ym: 21, size: 56, sizem: 48, theme: "blue" },
  { x: 92, y: 75, xm: 77, ym: 32, size: 60, sizem: 52, theme: "green" },
  { x: 85, y: 25, xm: 74, ym: 43, size: 58, sizem: 50, theme: "gold" },
  { x: 85, y: 55, xm: 76, ym: 57, size: 62, sizem: 52, theme: "purple" },
  { x: 78, y: 12, xm: 72, ym: 68, size: 54, sizem: 46, theme: "pink" },
  { x: 78, y: 38, xm: 77, ym: 79, size: 58, sizem: 50, theme: "blue" },
  { x: 78, y: 68, xm: 74, ym: 90, size: 64, sizem: 54, theme: "green" },
  { x: 71, y: 28, xm: 94, ym: 6, size: 52, sizem: 46, theme: "gold" },
  { x: 71, y: 58, xm: 92, ym: 16, size: 60, sizem: 52, theme: "purple" },
  { x: 64, y: 15, xm: 95, ym: 27, size: 56, sizem: 48, theme: "pink" },
  { x: 64, y: 45, xm: 91, ym: 37, size: 54, sizem: 50, theme: "blue" },
  { x: 64, y: 75, xm: 94, ym: 48, size: 62, sizem: 46, theme: "green" },
];

// ⚡ TỐC ĐỘ ANIMATION — chỉnh ở đây
const SPEED_MIN = 0.5;   // Tốc độ tối thiểu (trước: 0.4)
const SPEED_MAX = 0.9;   // Tốc độ tối đa (trước: 1.0)

export default function IconShowcase() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    let cw = contentEl.clientWidth;
    let ch = contentEl.clientHeight;

    const centerNode = contentEl.querySelector<HTMLElement>(".center-app-node");
    let centerObj: { x: number; y: number; r: number } | null = null;
    if (centerNode) {
      centerObj = { x: cw / 2, y: ch / 2, r: centerNode.offsetWidth / 2 + 6 };
    }

    interface Node {
      el: HTMLElement;
      innerEl: HTMLElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      frozen: boolean;
    }
    const nodes: Node[] = [];
    const nodeEls = contentEl.querySelectorAll<HTMLElement>(".floating-icon-node");
    const listeners: Array<{ el: HTMLElement; fn: (e: Event) => void }> = [];

    nodeEls.forEach((el) => {
      const isMobile = window.innerWidth <= 768;
      const sx = parseFloat(el.getAttribute(isMobile ? "data-x-mb" : "data-x-dt") || "0");
      const sy = parseFloat(el.getAttribute(isMobile ? "data-y-mb" : "data-y-dt") || "0");
      const x = (sx / 100) * cw;
      const y = (sy / 100) * ch;
      const r = el.offsetWidth / 2;
      const angle = Math.random() * Math.PI * 2;
      // ⚡ TỐC ĐỘ NHANH HƠN
      const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      const node: Node = {
        el,
        innerEl: el.querySelector(".floating-icon-inner") as HTMLElement,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        frozen: false,
      };
      nodes.push(node);

      const fn = (e: Event) => {
        e.stopPropagation();
        if (!node.frozen) {
          node.frozen = true;
          node.vx = 0;
          node.vy = 0;
          node.innerEl.classList.add("frozen");
        } else {
          node.frozen = false;
          const a = Math.random() * Math.PI * 2;
          const s = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
          node.vx = Math.cos(a) * s;
          node.vy = Math.sin(a) * s;
          node.innerEl.classList.remove("frozen");
        }
      };
      el.addEventListener("click", fn);
      listeners.push({ el, fn });
    });

    contentEl.style.opacity = "1";

    const onResize = () => {
      cw = contentEl.clientWidth;
      ch = contentEl.clientHeight;
      if (centerObj && centerNode) {
        centerObj.x = cw / 2;
        centerObj.y = ch / 2;
        centerObj.r = centerNode.offsetWidth / 2 + 6;
      }
      nodes.forEach((n) => (n.r = n.el.offsetWidth / 2));
    };
    window.addEventListener("resize", onResize);

    let rafId: number;
    const tick = () => {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.frozen) continue;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x - n.r < 0) {
          n.x = n.r;
          n.vx = -n.vx;
        } else if (n.x + n.r > cw) {
          n.x = cw - n.r;
          n.vx = -n.vx;
        }
        if (n.y - n.r < 0) {
          n.y = n.r;
          n.vy = -n.vy;
        } else if (n.y + n.r > ch) {
          n.y = ch - n.r;
          n.vy = -n.vy;
        }
        if (centerObj) {
          const dx = n.x - centerObj.x;
          const dy = n.y - centerObj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = n.r + centerObj.r;
          if (dist < minDist) {
            const nx = dx / (dist || 0.1);
            const ny = dy / (dist || 0.1);
            n.x = centerObj.x + nx * minDist;
            const dot = n.vx * nx + n.vy * ny;
            n.vx -= 2 * dot * nx;
            n.vy -= 2 * dot * ny;
          }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.el.style.transform = `translate3d(${n.x - n.r}px, ${n.y - n.r}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      listeners.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    };
  }, []);

  return (
    <div className="icon-showcase-section">
      <h2 className="icon-showcase-title">Kho Icon Locket Gold Độc Quyền</h2>
      <p className="icon-showcase-sub">
        Khoác lên diện mạo đẳng cấp với hàng chục thiết kế biểu tượng Locket Gold đặc quyền. Tự do thay đổi trực tiếp ngay trong ứng dụng của bạn.
      </p>

      <div className="icon-map-outer-wrapper">
        <div className="icon-map-canvas">
          <div className="icon-map-grid-bg" />
          <div className="icon-map-content" ref={contentRef}>
            <div className="center-app-node">
              <div className="center-app-pulse" />
              <div className="center-app-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/logo/icon.jpg" alt="Locket Gold App Icon" />
              </div>
            </div>
            {icons.map((ic, i) => (
              <div
                key={i}
                className="floating-icon-node"
                data-x-dt={ic.x}
                data-y-dt={ic.y}
                data-x-mb={ic.xm}
                data-y-mb={ic.ym}
                style={
                  {
                    "--size-dt": `${ic.size}px`,
                    "--size-mb": `${ic.sizem}px`,
                  } as React.CSSProperties
                }
              >
                <div className={`floating-icon-inner node-theme-${ic.theme}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/logo/icon/anh${i + 1}.png`}
                    alt={`Icon ${i + 1}`}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
