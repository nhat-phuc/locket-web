"use client";

import { useEffect } from "react";

export default function Jiggle() {
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
      'a[href*="facebook"]',
      'a[href*="tiktok"]',
      'a[href*="youtube"]',
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => attachJiggle(el as HTMLElement));
    });
  }, []);

  return null;
}
