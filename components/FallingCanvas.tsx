"use client";

import { useEffect, useRef } from "react";

export default function FallingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Load ảnh heart.png
    const heartImg = new Image();
    heartImg.src = "/heart.png";

    // Số lượng tim: 12 (ít)
    const MAX_HEARTS = 25;

    type Heart = {
      x: number;
      y: number;
      size: number;
      speed: number;
      drift: number;
      rot: number;
      rotSpd: number;
      alpha: number;
      sway: number;
      swaySpd: number;
      direction: 1 | -1; // 1 = rơi xuống, -1 = bay lên
    };

    const hearts: Heart[] = [];

    function makeHeart(direction: 1 | -1, startFromEdge = false): Heart {
      // Kích thước: 10-20px (nhỏ)
      const size = 30 + Math.random() * 20;

      // Vị trí X ngẫu nhiên
      const x = Math.random() * W;

      // Vị trí Y: nếu rơi → bắt đầu từ trên, nếu bay → bắt đầu từ dưới
      let y: number;
      if (startFromEdge) {
        y = direction === 1 ? -size : H + size;
      } else {
        y = Math.random() * H;
      }

      return {
        x,
        y,
        size,
        speed: 0.3 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.4,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.03,
        alpha: 0.4 + Math.random() * 0.4,
        sway: Math.random() * Math.PI * 2,
        swaySpd: 0.01 + Math.random() * 0.02,
        direction,
      };
    }

    // Tạo tim: nửa rơi, nửa bay
    for (let i = 0; i < MAX_HEARTS; i++) {
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      hearts.push(makeHeart(direction));
    }

    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];

        // Cập nhật vị trí
        h.sway += h.swaySpd;
        h.x += Math.sin(h.sway) * 0.4 + h.drift;
        h.y += h.speed * h.direction; // Rơi xuống hoặc bay lên
        h.rot += h.rotSpd;

        // Vẽ
        ctx.save();
        ctx.globalAlpha = isScrolling ? h.alpha : h.alpha * 0.5;
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);

        if (heartImg.complete && heartImg.naturalWidth > 0) {
          ctx.drawImage(
            heartImg,
            -h.size / 2,
            -h.size / 2,
            h.size,
            h.size
          );
        }
        ctx.restore();

        // Reset khi ra khỏi màn hình
        const outOfScreen =
          (h.direction === 1 && h.y > H + 30) ||
          (h.direction === -1 && h.y < -30) ||
          h.x < -50 ||
          h.x > W + 50;

        if (outOfScreen) {
          hearts[i] = makeHeart(h.direction, true);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Tăng alpha khi scroll
    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9998,
        opacity: 0.5,
      }}
    />
  );
}
