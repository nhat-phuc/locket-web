"use client";

import { useEffect } from "react";

export default function TouchEffect() {
  useEffect(() => {
    const created: HTMLElement[] = [];

    const spawn = (x: number, y: number) => {
      const ripple = document.createElement("div");
      ripple.className = "lk-touch-ripple";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      document.body.appendChild(ripple);
      created.push(ripple);
      setTimeout(() => {
        ripple.remove();
        const idx = created.indexOf(ripple);
        if (idx > -1) created.splice(idx, 1);
      }, 650);

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const el = document.createElement("img");
          el.src = "/img/logo/icon.jpg";
          el.className = "lk-touch-particle";
          const ox = (Math.random() - 0.5) * 60;
          el.style.left = x + ox + "px";
          el.style.top = y + "px";
          el.style.setProperty("--rot", (Math.random() - 0.5) * 30 + "deg");
          el.style.setProperty("--rot2", (Math.random() - 0.5) * 60 + "deg");
          const size = 16 + Math.random() * 16;
          el.style.width = size + "px";
          el.style.height = size + "px";
          document.body.appendChild(el);
          created.push(el);
          setTimeout(() => {
            el.remove();
            const idx = created.indexOf(el);
            if (idx > -1) created.splice(idx, 1);
          }, 1150);
        }, i * 80);
      }
    };

    const onClick = (e: MouseEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      spawn(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const t = e.touches[0];
      if (t) spawn(t.clientX, t.clientY);
    };
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("touchstart", onTouch);
      created.forEach((el) => el.remove());
    };
  }, []);

  return null;
}
