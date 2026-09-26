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

    const heartImg = new Image();
    heartImg.src = "/img/logo/icon.jpg";

    const MAX_P = 25;
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const mkParticle = () => ({
      x: Math.random() * W,
      y: -20,
      size: 12 + Math.random() * 18,
      speed: 0.4 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.04,
      alpha: 0.5 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpd: 0.01 + Math.random() * 0.02,
    });

    const particles = Array.from({ length: MAX_P }, () => {
      const p = mkParticle();
      p.y = Math.random() * H;
      return p;
    });

    let rafId: number;
    const anim = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.sway += pt.swaySpd;
        pt.x += Math.sin(pt.sway) * 0.8 + pt.drift;
        pt.y += pt.speed;
        pt.rot += pt.rotSpd;
        ctx.save();
        ctx.globalAlpha = isScrolling ? pt.alpha : pt.alpha * 0.35;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        if (heartImg.complete && heartImg.naturalWidth > 0)
          ctx.drawImage(heartImg, -pt.size / 2, -pt.size / 2, pt.size, pt.size);
        ctx.restore();
        if (pt.y > H + 20) particles[i] = mkParticle();
      }
      rafId = requestAnimationFrame(anim);
    };
    anim();

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => (isScrolling = false), 800);
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
      cancelAnimationFrame(rafId);
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="lk-falling-canvas" />;
}
