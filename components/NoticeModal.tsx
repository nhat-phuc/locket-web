"use client";

import { useEffect, useState } from "react";

export default function NoticeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("notice_hidden_until");
    if (!hideUntil || Date.now() > parseInt(hideUntil)) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => setVisible(false);
  const close24h = () => {
    close();
    localStorage.setItem(
      "notice_hidden_until",
      String(Date.now() + 24 * 60 * 60 * 1000)
    );
  };

  if (!visible) return null;

  return (
    <div className="admin-modal show" style={{ zIndex: 99999 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "32px 24px",
          borderRadius: 24,
          background: "linear-gradient(145deg, var(--bg-1), var(--bg-0))",
          border: "1px solid var(--border-accent)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            left: -20,
            right: -20,
            height: 120,
            background: "linear-gradient(135deg, #64d5f2, transparent)",
            opacity: 0.15,
            zIndex: 0,
            filter: "blur(20px)",
          }}
        />
        <button
          onClick={close}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.06)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--text-2)",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12,
              marginTop: 10,
              letterSpacing: -0.5,
              background: "linear-gradient(90deg, var(--accent-bright), #64d5f2)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Thông Báo
          </h2>
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--text-2)",
              marginBottom: 20,
              textAlign: "left",
              wordWrap: "break-word",
            }}
          >
            <div
              style={{
                textAlign: "center",
                border: "2px solid #f1c40f",
                padding: 15,
                borderRadius: 12,
                background: "linear-gradient(135deg, #fffcf0 0%, #ffffff 100%)",
                maxWidth: 500,
                margin: "0 auto",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <p style={{ margin: "0 0 12px 0" }}>
                <span
                  style={{
                    fontSize: 20,
                    color: "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  🚀 CHÀO MỪNG BẠN ĐẾN VỚI LOCKET GOLD 🚀
                </span>
              </p>
              <div
                style={{
                  backgroundColor: "#fff9f9",
                  border: "1px dashed #e74c3c",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: 15,
                    color: "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  💎 NÂNG CẤP TỰ ĐỘNG 5S - AN TOÀN TUYỆT ĐỐI
                </p>
                <p style={{ margin: "3px 0", fontSize: 13, color: "#333" }}>
                  ✅ <strong>Không cần Pass/iCloud</strong> - Chỉ cần duy nhất
                  Username.
                </p>
                <p style={{ margin: "3px 0", fontSize: 13, color: "#333" }}>
                  ✅ Hệ thống Auto từ A-Z, lên Gold cực mượt không cần chờ đợi.
                </p>
                <p
                  style={{
                    margin: "5px 0 3px 0",
                    fontSize: 12,
                    color: "#d35400",
                  }}
                >
                  <i>*🎁 Đặc biệt: Chốt đơn là TẶNG NGAY Canva Edu 3 Năm</i>
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px dashed #e67e22",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 15,
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: 15,
                    color: "#d35400",
                    fontWeight: "bold",
                  }}
                >
                  🎰 VÒNG QUAY NHÂN PHẨM
                </p>
                <p style={{ margin: "3px 0", fontSize: 13, color: "#333" }}>
                  Làm nhiệm vụ mỗi ngày nhận lượt quay FREE.
                </p>
                <p style={{ margin: "3px 0", fontSize: 13, color: "#2c3e50" }}>
                  Cơ hội trúng ngay <strong>Tiền mặt</strong> hoặc Voucher{" "}
                  <strong>FREE 100%</strong>.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <a
                  href="https://zalo.me/0344421026"
                  style={{
                    flex: 1,
                    backgroundColor: "#0088cc",
                    color: "#ffffff",
                    padding: "10px 0",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  💬 BOX ZALO HỖ TRỢ
                </a>
                <a
                  href="/vong-quay"
                  style={{
                    flex: 1,
                    backgroundColor: "#f39c12",
                    color: "#ffffff",
                    padding: "10px 0",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: 14,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  🎡 QUAY NGAY
                </a>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={close}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                background: "#64d5f2",
                color: "#111313",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              Đã hiểu
            </button>
            <button
              onClick={close24h}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 15,
                border: "1px solid rgba(248,113,113,0.3)",
                cursor: "pointer",
                background: "rgba(239,68,68,0.1)",
                color: "var(--red)",
              }}
            >
              Đóng trong 24h tới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
