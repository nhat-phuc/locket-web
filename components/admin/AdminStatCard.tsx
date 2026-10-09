"use client";

import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: { value: number; label?: string };
  onClick?: () => void;
}

export default function AdminStatCard({
  label,
  value,
  icon,
  color = "#2563eb",
  trend,
  onClick,
}: Props) {
  return (
    <div
      className="asc-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="asc-head">
        <div className="asc-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        {trend && (
          <div
            className="asc-trend"
            style={{
              color: trend.value >= 0 ? "#10b981" : "#ef4444",
              background: trend.value >= 0 ? "#ecfdf5" : "#fef2f2",
            }}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="asc-label">{label}</div>
      <div className="asc-value">{value}</div>

      <style jsx>{`
        .asc-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          transition: all 0.25s;
        }
        .asc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        .asc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .asc-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 20px;
        }
        .asc-trend {
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 800;
        }
        .asc-label {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .asc-value {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
