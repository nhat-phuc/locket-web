"use client";

import { featureList } from "@/lib/data";

export default function Marquee() {
  const doubled = [...featureList, ...featureList];

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 60, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            background: "linear-gradient(135deg, #C084FC, #F472B6)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Các Tính Năng Độc Quyền
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>
          Nâng cấp trải nghiệm với bộ công cụ mạnh mẽ và xịn xò nhất hiện nay.
        </p>
      </div>

      <div className="marquee-wrapper compact">
        <div className="marquee-track left" style={{ animationDuration: "35s" }}>
          {doubled.map((f, i) => (
            <div className="feature-card" key={`l-${i}`}>
              <div style={{ color: f.color, marginBottom: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: f.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--text-0)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--text-2)",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="marquee-track right" style={{ animationDuration: "35s" }}>
          {doubled.map((f, i) => (
            <div className="feature-card" key={`r-${i}`}>
              <div style={{ color: f.color, marginBottom: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: f.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--text-0)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--text-2)",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
