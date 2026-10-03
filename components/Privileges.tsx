import { privilegesList } from "@/lib/data";

export default function Privileges() {
  return (
    <div style={{ marginTop: 80, textAlign: "left" }}>
      <h2
        style={{
          marginBottom: 16,
          fontSize: 24,
          fontWeight: 800,
          color: "var(--text-0)",
        }}
      >
        Đặc Quyền Của Các Gói Locket Gold
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "var(--text-2)",
          marginBottom: 40,
          fontSize: 15,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Nâng cấp tài khoản để mở khóa toàn bộ sức mạnh của Locket Gold, không
        giới hạn tính năng và trải nghiệm trọn vẹn nhất.
      </p>

      <div className="privileges-grid">
        {privilegesList.map((p, i) => (
          <div
            className="privilege-card"
            key={i}
            style={{
              animationDelay: `${i * 0.02}s`,
              "--icon-color": p.iconColor,
            } as React.CSSProperties}
          >
            <div className="privilege-icon-wrapper">
              <span className="privilege-icon" style={{ color: p.iconColor }}>
                {p.icon}
              </span>
              <div className={`privilege-status-badge ${p.badgeType}`}>
                {p.badge}
              </div>
            </div>
            <h3 className="privilege-title">{p.title}</h3>
            <p className="privilege-desc">{p.desc}</p>

            {/* Hiệu ứng ánh sáng chạy qua khi hover */}
            <div className="privilege-shine" />
          </div>
        ))}
      </div>

      <style jsx>{`
        /* ═══ GRID ═══ */
        .privileges-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        @media (max-width: 900px) {
          .privileges-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .privileges-grid { grid-template-columns: 1fr; gap: 14px; }
        }

        /* ═══ CARD ═══ */
        .privilege-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px 20px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(167, 139, 250, 0.2);
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(167, 139, 250, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          /* ✅ Animation nhanh hơn */
          animation: privFadeIn 0.15s ease-out both;
        }

        @keyframes privFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ═══ HOVER ═══ */
        .privilege-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--icon-color);
          box-shadow: 0 16px 40px rgba(124, 58, 237, 0.2);
        }
        .privilege-card:hover .privilege-icon {
          transform: scale(1.15) rotate(-8deg);
        }
        .privilege-card:hover .privilege-shine {
          transform: translateX(100%);
        }

        /* ═══ ICON ═══ */
        .privilege-icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 0;
          width: auto;
          height: auto;
        }

        .privilege-icon {
          font-size: 26px;
          line-height: 1;
          display: inline-block;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ═══ BADGE ═══ */
        .privilege-status-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 900;
          letter-spacing: 0.3px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: badgePop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          animation-delay: inherit;
        }

        @keyframes badgePop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Badge styles cho từng loại */
        .privilege-status-badge.success {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #fff;
        }
        .privilege-status-badge.info {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: #fff;
        }

        /* ═══ TITLE ═══ */
        .privilege-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-0);
          line-height: 1.3;
          transition: color 0.3s;
        }
        .privilege-card:hover .privilege-title {
          color: var(--icon-color);
        }

        /* ═══ DESC ═══ */
        .privilege-desc {
          font-size: 13.5px;
          color: var(--text-2);
          line-height: 1.6;
        }

        /* ═══ SHINE (ánh sáng chạy qua) ═══ */
        .privilege-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: translateX(0);
          transition: transform 0.7s ease;
          pointer-events: none;
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .privilege-card,
          .privilege-status-badge {
            animation: none;
          }
          .privilege-card:hover {
            transform: none;
          }
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 600px) {
          .privilege-card { padding: 20px 16px; border-radius: 16px; }
          .privilege-icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 0;
          width: auto;
          height: auto;
        }
          .privilege-icon { font-size: 22px; }
          .privilege-title { font-size: 15px; }
          .privilege-desc { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
