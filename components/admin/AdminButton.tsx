"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "ab-primary",
  secondary: "ab-secondary",
  outline: "ab-outline",
  danger: "ab-danger",
  ghost: "ab-ghost",
  success: "ab-success",
};

const sizeClasses: Record<Size, string> = {
  sm: "ab-sm",
  md: "ab-md",
  lg: "ab-lg",
};

export default function AdminButton({
  variant = "primary",
  size = "md",
  icon,
  loading,
  children,
  className = "",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={`admin-btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="ab-spinner" />
      ) : icon ? (
        <span className="ab-icon">{icon}</span>
      ) : null}
      <span>{children}</span>

      <style jsx global>{`
        .admin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1.5px solid transparent;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .admin-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* SIZES */
        .ab-sm { padding: 7px 12px; font-size: 12.5px; }
        .ab-md { padding: 10px 16px; font-size: 13.5px; }
        .ab-lg { padding: 13px 22px; font-size: 15px; }

        /* ICON */
        .ab-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ab-icon svg { width: 16px; height: 16px; }

        /* SPINNER */
        .ab-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: abSpin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes abSpin { to { transform: rotate(360deg); } }

        /* ═══ PRIMARY — Gradient xanh ═══ */
        .ab-primary {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .ab-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.45);
          filter: brightness(1.05);
        }
        .ab-primary:active:not(:disabled) { transform: translateY(0); }

        /* ═══ SECONDARY — Xám ═══ */
        .ab-secondary {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #e2e8f0;
        }
        .ab-secondary:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        /* ═══ OUTLINE — Viền xanh ═══ */
        .ab-outline {
          background: #fff;
          color: #2563eb;
          border-color: #bfdbfe;
        }
        .ab-outline:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #2563eb;
          transform: translateY(-1px);
        }

        /* ═══ DANGER — Đỏ ═══ */
        .ab-danger {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        .ab-danger:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.45);
        }

        /* ═══ SUCCESS — Xanh lá ═══ */
        .ab-success {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .ab-success:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.45);
        }

        /* ═══ GHOST — Trong suốt ═══ */
        .ab-ghost {
          background: transparent;
          color: #475569;
        }
        .ab-ghost:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
        }
      `}</style>
    </button>
  );
}
