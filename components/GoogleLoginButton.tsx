"use client";

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
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
              logo_alignment?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env");
      return;
    }

    const handleCredential = async (response: { credential: string }) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();

        if (data.success) {
          sessionStorage.setItem("locket_user", JSON.stringify(data.user));
          router.push("/tai-khoan");
        } else {
          setError(data.message || "Đăng nhập thất bại");
        }
      } catch {
        setError("Lỗi kết nối, vui lòng thử lại");
      } finally {
        setLoading(false);
      }
    };

    const initGoogle = () => {
      if (!window.google || initializedRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: 340,
          logo_alignment: "left",
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) {
        existing.addEventListener("load", initGoogle);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => setError("Không thể tải Google Sign-In");
        document.head.appendChild(script);
      }
    }
  }, [router]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <div
        style={{
          padding: 12,
          borderRadius: 10,
          background: "rgba(248,113,113,.1)",
          border: "1px solid rgba(248,113,113,.3)",
          color: "#f87171",
          fontSize: 13,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        ⚠️ Chưa cấu hình Google Client ID
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span
          style={{
            fontSize: 12,
            color: "var(--text-2)",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          HOẶC
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: "rgba(248,113,113,.1)",
            border: "1px solid rgba(248,113,113,.3)",
            color: "#f87171",
            fontSize: 13,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <div
        ref={buttonRef}
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: 44,
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      />
    </div>
  );
}
