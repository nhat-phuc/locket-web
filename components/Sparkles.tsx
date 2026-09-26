"use client";

import { useEffect } from "react";

export default function Sparkles() {
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

  return null;
}
