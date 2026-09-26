"use client";

import { useState } from "react";
import { faqItems } from "@/lib/data";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ marginTop: 80, textAlign: "left" }}>
      <h2
        style={{
          marginBottom: 32,
          fontSize: 24,
          fontWeight: 800,
          color: "var(--text-0)",
        }}
      >
        Câu Hỏi Thường Gặp (FAQ)
      </h2>

      {faqItems.map((item, i) => (
        <div className={`faq-item${open === i ? " active" : ""}`} key={i}>
          <div
            className="faq-header"
            onClick={() => setOpen((prev) => (prev === i ? null : i))}
          >
            <div className="faq-header-left">
              <div className="faq-icon-box">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span>{item.q}</span>
            </div>
            <div className="faq-toggle-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div className={`faq-content${open === i ? " open" : ""}`}>
            <div className="faq-content-inner">{item.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
