"use client";

import { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface Props {
  variant?: Variant;
  children: ReactNode;
  dot?: boolean;
}

const styles: Record<Variant, { bg: string; color: string; dot: string }> = {
  success: { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  warning: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  danger: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  info: { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
  neutral: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  purple: { bg: "#f5f3ff", color: "#7c3aed", dot: "#a78bfa" },
};

export default function AdminBadge({ variant = "neutral", children, dot }: Props) {
  const s = styles[variant];
  return (
    <span
      className="admin-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {dot && (
        <span
          className="ab-dot"
          style={{ background: s.dot }}
        />
      )}
      {children}

      <style jsx global>{`
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }
        .ab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px currentColor;
          opacity: 0.2;
        }
      `}</style>
    </span>
  );
}
