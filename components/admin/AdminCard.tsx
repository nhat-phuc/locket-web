"use client";

import { ReactNode, CSSProperties } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  padding?: number;
  style?: CSSProperties;
}

export default function AdminCard({
  title,
  subtitle,
  icon,
  action,
  children,
  padding = 20,
  style,
}: Props) {
  return (
    <div className="ac-card" style={style}>
      {(title || action) && (
        <div className="ac-head">
          <div className="ac-title-wrap">
            {icon && <div className="ac-icon">{icon}</div>}
            <div>
              {title && <div className="ac-title">{title}</div>}
              {subtitle && <div className="ac-sub">{subtitle}</div>}
            </div>
          </div>
          {action && <div className="ac-action">{action}</div>}
        </div>
      )}
      <div className="ac-body" style={{ padding }}>
        {children}
      </div>

      <style jsx>{`
        .ac-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.25s;
        }
        .ac-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .ac-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        .ac-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .ac-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-radius: 10px;
          font-size: 18px;
          flex-shrink: 0;
        }
        .ac-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .ac-sub {
          font-size: 12.5px;
          color: #64748b;
          margin-top: 2px;
        }
        .ac-action {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
