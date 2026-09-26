"use client";

import { useEffect } from "react";

export default function FXEffects() {
  /* ─── 1. TOUCH PARTICLE (hạt bay khi click) ─── */
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

  /* ─── 2. SPARKLE DOTS (đốm sáng nền) ─── */
  useEffect(() => {
    const colors = [
      "rgba(167,139,250,0.22)",
      "rgba(244,114,182,0.18)",
      "rgba(52,211,153,0.15)",
      "rgba(251,191,36,0.14)",
      "rgba(96,165,250,0.16)",
    ];
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement("div");
      dot.className = "lk-sparkle-dot";
      const size = 200 + Math.random() * 350;
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.left = Math.random() * 100 + "vw";
      dot.style.top = Math.random() * 100 + "vh";
      dot.style.transform = "translate(-50%,-50%)";
      dot.style.background =
        "radial-gradient(circle, " + colors[i % colors.length] + ", transparent 70%)";
      dot.style.setProperty("--dur", 3 + Math.random() * 5 + "s");
      dot.style.animationDelay = Math.random() * 3 + "s";
      document.body.appendChild(dot);
      dots.push(dot);
    }
    return () => dots.forEach((d) => d.remove());
  }, []);

  /* ─── 3. JIGGLE cho CTA buttons ─── */
  useEffect(() => {
    const attachJiggle = (el: HTMLElement) => {
      let timer: ReturnType<typeof setTimeout>;
      const doJiggle = () => {
        el.classList.remove("lk-jiggle");
        void el.offsetWidth;
        el.classList.add("lk-jiggle");
        el.addEventListener("animationend", function cleanup() {
          el.classList.remove("lk-jiggle");
          el.removeEventListener("animationend", cleanup);
        });
      };
      const scheduleJiggle = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          doJiggle();
          scheduleJiggle();
        }, 3000 + Math.random() * 5000);
      };
      scheduleJiggle();
      el.addEventListener("mouseenter", doJiggle);
    };

    const selectors = [
      ".btn-primary",
      'a[href*="zalo"]',
      'a[href*="t.me"]',
      ".nav-link[href*=\"bang-gia\"]",
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => attachJiggle(el as HTMLElement));
    });
  }, []);

  /* ─── 4. REVEAL ON SCROLL ─── */
  useEffect(() => {
    if (document.querySelector(".admin-wrap")) return;
    const elementsToReveal = document.querySelectorAll(
      ".card, .box, section, h1, h2, .footer-col"
    );
    elementsToReveal.forEach((el) => {
      if (!el.classList.contains("hide") && !el.id.includes("modal")) {
        el.classList.add("reveal-on-scroll");
      }
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
