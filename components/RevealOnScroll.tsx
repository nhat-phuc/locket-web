"use client";

import { useEffect } from "react";

export default function RevealOnScroll() {
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
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
