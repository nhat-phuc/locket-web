"use client";

import { useState } from "react";
import { reviews } from "@/lib/data";

const REVIEW_INITIAL = 16;
const REVIEW_STEP = 16;

export default function Reviews() {
  const [shown, setShown] = useState(REVIEW_INITIAL);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const display = reviews.slice(0, shown);
  const total = reviews.length;

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>
          Đánh Giá Khách Hàng
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>
          Cảm nhận thực tế từ khách hàng đã sử dụng dịch vụ
        </p>
      </div>

      <div className="review-feed">
        {display.map((r, i) => (
          <div className="review-card" key={i}>
            <div
              className="review-img-wrap"
              onClick={() => setLightboxImg(r.img)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.img}
                alt={`Đánh giá từ ${r.name}`}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".review-no-img")) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "review-no-img";
                    placeholder.textContent = r.initial;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            </div>
            <div className="review-head">
              <div className="review-avatar">{r.initial}</div>
              <div className="review-info">
                <div className="review-name">{r.name}</div>
              </div>
            </div>
            <div className="review-text">{r.text}</div>
            <div className="review-time">{r.time}</div>
          </div>
        ))}
      </div>

      <div className="review-ctrl-wrap">
        {shown < total && (
          <button
            className="review-ctrl-btn"
            onClick={() => setShown((c) => Math.min(c + REVIEW_STEP, total))}
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
            Xem thêm đánh giá
          </button>
        )}
        {shown > REVIEW_INITIAL && (
          <button
            className="review-ctrl-btn close-btn"
            onClick={() => setShown(REVIEW_INITIAL)}
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
            Đóng lại
          </button>
        )}
      </div>

      {lightboxImg && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImg(null)}
        >
          <div className="lightbox-close">✕</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="lightbox-img"
          />
        </div>
      )}
    </>
  );
}
