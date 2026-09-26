"use client";

import { useState } from "react";
import { depositData, badgeColors, badgeTextColors, badgeLabels } from "@/lib/data";

const INITIAL_COUNT = 12;
const STEP_COUNT = 8;

export default function Deposits() {
  const [displayedCount, setDisplayedCount] = useState(INITIAL_COUNT);
  const display = depositData.slice(0, displayedCount);
  const total = depositData.length;

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 60, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>
          Giao Dịch Gần Đây
        </h2>
      </div>

      <div className="deposits-grid">
        {display.map((item, i) => {
          const bg = badgeColors[item.type] || "rgba(167,139,250,0.12)";
          const color = badgeTextColors[item.type] || "#a78bfa";
          const label = badgeLabels[item.type] || "VIP";
          return (
            <div key={i} className="deposit-item">
              <div className="deposit-icon" style={{ background: bg, color }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="deposit-meta">
                <div className="deposit-row1">
                  <span className="deposit-name">{item.name}</span>
                  <span
                    className="deposit-badge-role"
                    style={{ background: bg, color }}
                  >
                    {label}
                  </span>
                  {item.discount && (
                    <span className="deposit-badge-discount">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Giảm {item.discount}
                    </span>
                  )}
                </div>
                <div className="deposit-time">{item.time}</div>
              </div>
              <div className="deposit-right">
                <div className="deposit-amount">
                  +{item.amount.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="review-ctrl-wrap">
        {displayedCount < total && (
          <button
            className="review-ctrl-btn"
            onClick={() =>
              setDisplayedCount((c) => Math.min(c + STEP_COUNT, total))
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Xem thêm giao dịch
          </button>
        )}
        {displayedCount > INITIAL_COUNT && (
          <button
            className="review-ctrl-btn close-btn"
            onClick={() => setDisplayedCount(INITIAL_COUNT)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            Thu gọn
          </button>
        )}
      </div>
    </>
  );
}
