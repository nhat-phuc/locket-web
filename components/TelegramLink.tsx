"use client";

import { useEffect, useState } from "react";

export default function TelegramLink({ className }: { className?: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [linked, setLinked] = useState(false);

  const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

  useEffect(() => {
    // Lấy user từ API
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUser(d.user);
          setLinked(!!d.user?.telegramId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Link trực tiếp: t.me/BOT?start=USER_ID
  const getLink = () => {
    if (!user?.id || !BOT) return "";
    return `https://t.me/${BOT}?start=${user.id}`;
  };

  const handleUnlink = async () => {
    if (!confirm("Hủy liên kết Telegram?")) return;
    setChecking(true);
    try {
      const res = await fetch("/api/telegram/unlink", { method: "POST" });
      const d = await res.json();
      if (d.success) {
        setLinked(false);
        setUser({ ...user, telegramId: null });
      }
    } catch {}
    finally { setChecking(false); }
  };

  if (loading) {
    return (
      <div className={`tg-wrap ${className || ""}`}>
        <div className="tg-loading">Đang tải...</div>
        <style jsx>{`
          .tg-wrap { padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.8); border: 1.5px solid rgba(167,139,250,0.2); }
          .tg-loading { font-size: 13px; color: #9ca3af; text-align: center; }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`tg-wrap ${className || ""}`}>
      <div className="tg-header">
        <div className="tg-icon">✈️</div>
        <div className="tg-info">
          <div className="tg-title">Liên Kết Telegram</div>
          <div className="tg-desc">
            {linked ? "Đã liên kết" : "Nhận thông báo qua Telegram"}
          </div>
        </div>
        {linked && <div className="tg-badge">✓</div>}
      </div>

      {!BOT ? (
        <div className="tg-error">
          ⚠️ Bot chưa cấu hình. Thêm <code>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</code> vào .env
        </div>
      ) : !linked ? (
        <a
          href={getLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="tg-btn tg-btn-primary"
        >
          ✈️ Liên kết ngay qua Bot
        </a>
      ) : (
        <button onClick={handleUnlink} disabled={checking} className="tg-btn tg-btn-danger">
          {checking ? "Đang xử lý..." : "🔓 Hủy liên kết"}
        </button>
      )}

      <div className="tg-hint">
        {!linked ? "Bấm nút → mở bot → bấm Start là xong" : "Bạn sẽ nhận thông báo qua Telegram"}
      </div>

      <style jsx>{`
        .tg-wrap { padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); border: 1.5px solid rgba(167,139,250,0.2); box-shadow: 0 4px 20px rgba(167,139,250,0.08); }
        .tg-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .tg-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg,#229ed9,#1e8fd0); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(34,158,217,0.25); }
        .tg-info { flex: 1; min-width: 0; }
        .tg-title { font-size: 14px; font-weight: 800; color: #111; }
        .tg-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .tg-badge { padding: 4px 10px; border-radius: 999px; background: rgba(34,197,94,0.15); color: #22c55e; font-size: 11px; font-weight: 800; }
        .tg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 20px; border-radius: 12px; border: none; font-size: 14px; font-weight: 800; font-family: inherit; text-decoration: none; cursor: pointer; margin-bottom: 10px; transition: all 0.2s; }
        .tg-btn-primary { background: linear-gradient(135deg,#229ed9,#1e8fd0); color: #fff; box-shadow: 0 8px 24px rgba(34,158,217,0.3); }
        .tg-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(34,158,217,0.4); }
        .tg-btn-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1.5px solid rgba(239,68,68,0.25); }
        .tg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .tg-error { padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
        .tg-error code { background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; font-size: 11px; }
        .tg-hint { font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center; }
      `}</style>
    </div>
  );
}
