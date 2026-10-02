"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

interface Props {
  onSuccess?: () => void;
}

export default function GoogleLoginButton({ onSuccess }: Props) {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!scriptLoaded || !btnRef.current || !window.google || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setLoading(true);
        setError("");
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });
          const data = await res.json();

          if (data.success && data.user) {
            sessionStorage.setItem("locket_user", JSON.stringify(data.user));
            if (onSuccess) onSuccess();
            router.push("/tai-khoan");
            router.refresh();
          } else {
            setError(data.message || "Đăng nhập thất bại");
            setLoading(false);
          }
        } catch {
          setError("Lỗi kết nối, vui lòng thử lại");
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: "400",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
    });
  }, [scriptLoaded, clientId, onSuccess, router]);

  if (!clientId) {
    return (
      <div className="gg-warning">
        ⚠️ Chưa cấu hình Google Client ID
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="gg-wrap">
        {loading && (
          <div className="gg-loading">
            <div className="gg-spinner"></div>
            <span>Đang xác thực...</span>
          </div>
        )}

        {error && !loading && (
          <div className="gg-error">❌ {error}</div>
        )}

        <div
          ref={btnRef}
          className="gg-btn-container"
          style={{ display: loading ? "none" : "block" }}
        />

        {!scriptLoaded && !loading && (
          <div className="gg-skeleton">
            <div className="gg-skeleton-icon"></div>
            <div className="gg-skeleton-text"></div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .gg-wrap {
          width: 100%;
          position: relative;
        }

        /* ═══ CONTAINER — BO TRÒN, KHÔNG VIỀN TRÙNG ═══ */
        .gg-btn-container {
          width: 100%;
          height: 50px;
          border-radius: 12px !important;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          position: relative;
        }

        .gg-btn-container:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(167, 139, 250, 0.2);
        }

        /* Override iframe Google — bo tròn khớp container */
        .gg-btn-container > div,
        .gg-btn-container iframe {
          border-radius: 12px !important;
          overflow: hidden !important;
          width: 100% !important;
        }

        /* KHÔNG dùng ::before nữa — để tránh viền trùng */

        /* ═══ SKELETON ═══ */
        .gg-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: #ffffff;
          border: 1.5px solid #dadce0;
          border-radius: 12px;
          animation: ggPulse 1.5s ease-in-out infinite;
        }
        .gg-skeleton-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
          flex-shrink: 0;
        }
        .gg-skeleton-text {
          flex: 1;
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: ggShimmer 1.5s infinite;
        }
        @keyframes ggShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes ggPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* ═══ LOADING ═══ */
        .gg-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          border: 1.5px solid #c4b5fd;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: #7c3aed;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .gg-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(124, 58, 237, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: ggSpin 0.8s linear infinite;
        }
        @keyframes ggSpin {
          to { transform: rotate(360deg); }
        }

        /* ═══ ERROR ═══ */
        .gg-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #dc2626;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          margin-bottom: 12px;
          text-align: center;
        }

        /* ═══ WARNING ═══ */
        .gg-warning {
          padding: 12px 16px;
          background: rgba(251, 191, 36, 0.1);
          border: 1.5px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          color: #92400e;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          font-family: inherit;
        }

        div[style*="width: 400px"] iframe,
        div[style*="width: 100%"] iframe {
          border-radius: 12px !important;
        }

        iframe[src*="accounts.google.com"] {
          border-radius: 12px !important;
        }
      `}</style>
    </>
  );
}
