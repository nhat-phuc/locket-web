"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
// 
import Navbar from "@/components/Navbar";

const CONFIG = {
  bankId: "TPBank",
  bankName: "TPBank",
  accountNo: "36886368888",
  accountName: "TRAN NHAT PHUC",
  MIN_AMOUNT: 10000,
  MAX_AMOUNT: 500000000,
  COUNTDOWN_SECONDS: 15 * 60,
  POLL_INTERVAL: 3000,
};

type OrderStatus = "idle" | "pending" | "paid" | "expired";

interface User {
  email: string;
  username?: string;
  name?: string;
}

interface RecentTx {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000, 1000000];

export default function NapTienPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [status, setStatus] = useState<OrderStatus>("idle");
  const [countdown, setCountdown] = useState(CONFIG.COUNTDOWN_SECONDS);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "manual">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      router.push("/dang-nhap");
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      fetch(`/api/balance?email=${encodeURIComponent(u.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBalance(d.balance || 0);
        })
        .catch(() => {});
      loadRecentTxs();
    } catch {
      router.push("/dang-nhap");
    }
  }, [router]);

  const loadRecentTxs = () => {
    fetch("/api/users/transactions?limit=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecentTxs(d.transactions || []);
      })
      .catch(() => {});
  };

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const s = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(s || 0);
      setShowTop(h.scrollTop > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number; c: string }> = [];
    const colors = ["#4ade80", "#a78bfa", "#60a5fa", "#fbbf24"];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.2,
        c: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    let raf: number;
    const anim = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(anim);
    };
    anim();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleCreateQR = async () => {
    if (!user) return;
    if (amount < CONFIG.MIN_AMOUNT) {
      showToast("error", "Số tiền tối thiểu 10.000đ");
      return;
    }
    if (amount > CONFIG.MAX_AMOUNT) {
      showToast("error", "Số tiền vượt quá giới hạn");
      return;
    }

    const username = user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const code = "NPT" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const ct = "NAP " + username;

    try {
      await fetch("/api/recharge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          username,
          amount,
          content: ct,
          orderCode: code,
        }),
      });
    } catch {}

    setOrderCode(code);
    setContent(ct);
    setQrUrl(
      `https://img.vietqr.io/image/${CONFIG.bankId}-${CONFIG.accountNo}-compact.png` +
        `?amount=${amount}` +
        `&addInfo=${encodeURIComponent(ct)}` +
        `&accountName=${encodeURIComponent(CONFIG.accountName)}`
    );
    setStatus("pending");
    setCountdown(CONFIG.COUNTDOWN_SECONDS);
    showToast("success", "Đã tạo mã QR. Vui lòng chuyển khoản!");
  };

  // Countdown
  useEffect(() => {
    if (status !== "pending") return;
    cdRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (cdRef.current) clearInterval(cdRef.current);
          setStatus("expired");
          fetch("/api/recharge/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderCode, email: user?.email }),
          }).catch(() => {});
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cdRef.current) clearInterval(cdRef.current);
    };
  }, [status, orderCode, user]);

  // Polling
  useEffect(() => {
    if (status !== "pending" || !orderCode || !user) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/recharge/check?code=${orderCode}&email=${user.email}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.status === "paid") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (cdRef.current) clearInterval(cdRef.current);
          setBalance(data.balance || 0);
          setStatus("paid");
          setShowConfetti(true);
          loadRecentTxs();
          showToast("success", `Nạp thành công ${amount.toLocaleString("vi-VN")}đ!`);
          setTimeout(() => setShowConfetti(false), 3500);
        } else if (data.status === "expired" || data.status === "cancelled") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (cdRef.current) clearInterval(cdRef.current);
          setStatus("expired");
        }
      } catch {}
    }, CONFIG.POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, orderCode, user, amount]);

  const copy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      showToast("success", `Đã copy ${field}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      showToast("error", "Không copy được");
    }
  };

  if (!user) return null;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const timerProgress = countdown / CONFIG.COUNTDOWN_SECONDS;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerProgress);

  return (
    <>
      <div className="nt-progress" style={{ transform: `scaleX(${progress / 100})` }} />

      <Header />

      <main className="wrap center-y" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="page-shell">
          {/* HERO */}
          <div className="nt-hero">
            <canvas ref={canvasRef} className="nt-hero-canvas" />
            <div className="nt-hero-content">
              <div className="nt-hero-badge">
                <span className="nt-hero-dot" />
                Nạp tiền tự động
              </div>
              <h1 className="nt-hero-title">
                Nạp Tiền Vào{" "}
                <span className="nt-hero-gradient">Ví Locket Gold</span>
              </h1>
              <p className="nt-hero-desc">
                Nạp nhanh qua VietQR — Tiền vào ví tự động trong 1-2 phút
              </p>

              {/* BALANCE */}
              <div className="nt-balance">
                <div className="nt-balance-label">Số dư hiện tại</div>
                <div className="nt-balance-value">{balance.toLocaleString("vi-VN")}đ</div>
              </div>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="nt-main">
            {/* LEFT: FORM */}
            <div className="nt-form-wrap">
              <div className="nt-card">
                <div className="nt-card-title">
                  <span className="nt-card-title-icon">💰</span>
                  <span>Nhập số tiền muốn nạp</span>
                </div>

                <div className="nt-amount-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount ? amount.toLocaleString("vi-VN") : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      let n = raw ? parseInt(raw) : 0;
                      if (n > CONFIG.MAX_AMOUNT) n = CONFIG.MAX_AMOUNT;
                      setAmount(n);
                    }}
                    disabled={status === "pending"}
                    placeholder="0"
                    className="nt-input"
                  />
                  <span className="nt-input-suffix">VNĐ</span>
                </div>

                <div className="nt-quick">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      disabled={status === "pending"}
                      className={`nt-quick-btn${amount === v ? " active" : ""}`}
                    >
                      {v.toLocaleString("vi-VN")}đ
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreateQR}
                  disabled={status === "pending" || amount < CONFIG.MIN_AMOUNT}
                  className="nt-submit"
                >
                  <span className="nt-submit-shine" />
                  {status === "pending" ? "✓ Đã tạo mã QR" : "📱 Tạo Mã QR Nạp Tiền"}
                </button>

                <div className="nt-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Số tiền tối thiểu 10.000đ · Tối đa 500.000.000đ
                </div>
              </div>

              {/* RECENT */}
              {recentTxs.length > 0 && (
                <div className="nt-card">
                  <div className="nt-card-title">
                    <span className="nt-card-title-icon">📋</span>
                    <span>Lịch sử gần đây</span>
                  </div>
                  <div className="nt-recent">
                    {recentTxs.slice(0, 5).map((t) => {
                      const isIn = t.amount > 0;
                      return (
                        <div key={t.id} className="nt-recent-item">
                          <div
                            className="nt-recent-icon"
                            style={{
                              background: isIn ? "rgba(74,222,128,.12)" : "rgba(248,113,113,.12)",
                              color: isIn ? "#4ade80" : "#f87171",
                            }}
                          >
                            {isIn ? "↓" : "↑"}
                          </div>
                          <div className="nt-recent-info">
                            <div className="nt-recent-desc">{t.description || t.type}</div>
                            <div className="nt-recent-time">
                              {new Date(t.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                          <div
                            className="nt-recent-amount"
                            style={{ color: isIn ? "#4ade80" : "#f87171" }}
                          >
                            {isIn ? "+" : ""}
                            {t.amount.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link href="/tai-khoan/giao-dich" className="nt-recent-more">
                    Xem tất cả →
                  </Link>
                </div>
              )}
            </div>

            {/* RIGHT: QR / STATUS */}
            {status !== "idle" && (
              <div className="nt-qr-wrap">
                {status === "pending" && (
                  <>
                    {/* TIMER */}
                    <div className="nt-timer">
                      <div className="nt-timer-circle">
                        <svg viewBox="0 0 60 60">
                          <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(251,191,36,.2)" strokeWidth="4" />
                          <circle
                            cx="30"
                            cy="30"
                            r={radius}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                          />
                        </svg>
                        <div className="nt-timer-text">{timeStr}</div>
                      </div>
                      <div className="nt-timer-info">
                        <div className="nt-timer-label">Hết hạn sau</div>
                        <div className="nt-timer-value">{timeStr}</div>
                      </div>
                    </div>

                    {/* TABS */}
                    <div className="nt-tabs">
                      <button
                        className={`nt-tab${activeTab === "qr" ? " active" : ""}`}
                        onClick={() => setActiveTab("qr")}
                      >
                        📱 QR Code
                      </button>
                      <button
                        className={`nt-tab${activeTab === "manual" ? " active" : ""}`}
                        onClick={() => setActiveTab("manual")}
                      >
                        💳 Chuyển khoản
                      </button>
                    </div>

                    {/* QR */}
                    {activeTab === "qr" && (
                      <div className="nt-qr-section">
                        <div className="nt-qr-wrap-inner">
                          <div className="nt-qr-brand">
                            <span className="viet">Viet</span>
                            <span className="qr">QR</span>
                          </div>
                          <div className="nt-qr">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrUrl} alt="QR thanh toán" />
                          </div>
                        </div>
                        <div className="nt-qr-hint">
                          📸 Mở app ngân hàng và quét mã QR
                        </div>
                      </div>
                    )}

                    {/* MANUAL */}
                    {activeTab === "manual" && (
                      <div className="nt-bank">
                        <div className="nt-bank-row">
                          <span className="nt-bank-label">Ngân hàng</span>
                          <span className="nt-bank-value"><span>{CONFIG.bankName}</span></span>
                        </div>
                        <div className="nt-bank-row">
                          <span className="nt-bank-label">Số tài khoản</span>
                          <span className="nt-bank-value">
                            <span>{CONFIG.accountNo}</span>
                            <button
                              className={`nt-copy${copiedField === "STK" ? " copied" : ""}`}
                              onClick={() => copy(CONFIG.accountNo, "STK")}
                            >
                              {copiedField === "STK" ? "✓" : "📋"}
                            </button>
                          </span>
                        </div>
                        <div className="nt-bank-row">
                          <span className="nt-bank-label">Chủ tài khoản</span>
                          <span className="nt-bank-value"><span>{CONFIG.accountName}</span></span>
                        </div>
                        <div className="nt-bank-row">
                          <span className="nt-bank-label">Số tiền</span>
                          <span className="nt-bank-value" style={{ color: "#4ade80" }}>
                            <span>{amount.toLocaleString("vi-VN")}đ</span>
                            <button
                              className={`nt-copy${copiedField === "số tiền" ? " copied" : ""}`}
                              onClick={() => copy(String(amount), "số tiền")}
                            >
                              {copiedField === "số tiền" ? "✓" : "📋"}
                            </button>
                          </span>
                        </div>
                        <div className="nt-bank-row">
                          <span className="nt-bank-label">Nội dung</span>
                          <span className="nt-bank-value">
                            <span>{content}</span>
                            <button
                              className={`nt-copy${copiedField === "nội dung" ? " copied" : ""}`}
                              onClick={() => copy(content, "nội dung")}
                            >
                              {copiedField === "nội dung" ? "✓" : "📋"}
                            </button>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STATUS */}
                    <div className="nt-status">
                      <div className="nt-status-dot" />
                      <span>Đang chờ nhận tiền... Hệ thống tự động cộng tiền sau 1-2 phút</span>
                    </div>
                  </>
                )}

                {status === "paid" && (
                  <div className="nt-success">
                    <div className="nt-success-icon">🎉</div>
                    <div className="nt-success-title">Nạp tiền thành công!</div>
                    <div className="nt-success-amount">
                      +{amount.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="nt-success-balance">
                      Số dư mới: <strong>{balance.toLocaleString("vi-VN")}đ</strong>
                    </div>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setOrderCode(null);
                        setAmount(0);
                      }}
                      className="nt-btn-primary"
                    >
                      Nạp thêm
                    </button>
                  </div>
                )}

                {status === "expired" && (
                  <div className="nt-expired">
                    <div className="nt-expired-icon">⏰</div>
                    <div className="nt-expired-title">Đơn đã hết hạn</div>
                    <div className="nt-expired-desc">
                      Vui lòng tạo đơn mới để tiếp tục nạp tiền.
                    </div>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setOrderCode(null);
                        setAmount(0);
                      }}
                      className="nt-btn-primary"
                    >
                      🔄 Tạo đơn mới
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/*  */}
      <Navbar />

      {showTop && (
        <button
          className="nt-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* CONFETTI */}
      {showConfetti && (
        <div className="nt-confetti">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ["#4ade80", "#a78bfa", "#fbbf24", "#f472b6", "#60a5fa"];
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = 2 + Math.random() * 1.5;
            const rotate = Math.random() * 360;
            return (
              <div
                key={i}
                className="nt-confetti-piece"
                style={{
                  left: `${left}%`,
                  background: color,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  transform: `rotate(${rotate}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {toast && (
        <div className={`nt-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"}
          <span>{toast.msg}</span>
        </div>
      )}

      <style>{`
        .nt-progress {
          position: fixed; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #4ade80, #a78bfa, #f472b6);
          transform-origin: left; z-index: 9999;
          transition: transform .1s linear;
          box-shadow: 0 0 12px rgba(74,222,128,.6);
        }

        /* HERO */
        .nt-hero {
          position: relative; text-align: center;
          margin-bottom: 40px; padding: 40px 24px;
          border-radius: 28px;
          background: radial-gradient(ellipse at center top, rgba(74,222,128,.1), transparent 70%);
          overflow: hidden; min-height: 300px;
          display: flex; align-items: center; justify-content: center;
        }
        .nt-hero-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none; opacity: .8;
        }
        .nt-hero-content { position: relative; z-index: 1; }
        .nt-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 999px;
          background: linear-gradient(135deg, rgba(74,222,128,.15), rgba(167,139,250,.1));
          border: 1px solid rgba(74,222,128,.3);
          font-size: 12px; font-weight: 700; color: #4ade80;
          letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        .nt-hero-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 12px #4ade80;
          animation: ntPulse 2s infinite;
        }
        @keyframes ntPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.3); }
        }
        .nt-hero-title {
          font-size: clamp(28px, 4.5vw, 46px); font-weight: 900;
          line-height: 1.15; letter-spacing: -1.8px;
          color: var(--text-0); margin-bottom: 14px;
        }
        .nt-hero-gradient {
          background: linear-gradient(135deg, #4ade80, #a78bfa, #f472b6);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ntGradient 6s ease infinite;
        }
        @keyframes ntGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .nt-hero-desc {
          font-size: 15px; color: var(--text-2);
          max-width: 520px; margin: 0 auto 28px;
        }
        .nt-balance {
          display: inline-flex; flex-direction: column; align-items: center;
          gap: 4px;
          padding: 18px 36px; border-radius: 22px;
          background: linear-gradient(135deg, rgba(74,222,128,.15), rgba(167,139,250,.08));
          border: 1px solid rgba(74,222,128,.3);
          backdrop-filter: blur(10px);
        }
        .nt-balance-label {
          font-size: 11px; color: var(--text-2);
          font-weight: 800; letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .nt-balance-value {
          font-size: 32px; font-weight: 900;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1.5px;
        }

        /* MAIN */
        .nt-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .nt-main { grid-template-columns: 1fr; }
        }

        .nt-form-wrap { display: flex; flex-direction: column; gap: 18px; }

        .nt-card {
          padding: 26px;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
          border: 1.5px solid var(--border);
        }
        body[data-mode="light"] .nt-card {
          background: linear-gradient(145deg, rgba(255,255,255,.95), rgba(255,255,255,.75));
        }
        .nt-card-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 16px; font-weight: 900; letter-spacing: -.3px;
          color: var(--text-0); margin-bottom: 20px;
        }
        .nt-card-title-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 6px 18px rgba(34,197,94,.4);
        }

        .nt-amount-input { position: relative; margin-bottom: 16px; }
        .nt-input {
          width: 100%;
          padding: 20px 70px 20px 24px;
          font-size: 24px; font-weight: 900;
          background: rgba(0,0,0,.25);
          border: 2px solid var(--border);
          border-radius: 18px;
          color: var(--text-0);
          outline: none;
          letter-spacing: -.5px;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
          font-family: inherit;
        }
        body[data-mode="light"] .nt-input { background: rgba(255,255,255,.8); }
        .nt-input:focus {
          border-color: #4ade80;
          background: rgba(74,222,128,.06);
          box-shadow: 0 0 0 4px rgba(74,222,128,.15);
        }
        .nt-input::placeholder { color: var(--text-2); opacity: .4; }
        .nt-input-suffix {
          position: absolute;
          right: 24px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; font-weight: 900;
          color: var(--text-2);
          letter-spacing: .5px;
        }

        .nt-quick {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 20px;
        }
        .nt-quick-btn {
          padding: 12px 8px;
          border-radius: 12px;
          background: rgba(0,0,0,.15);
          border: 1.5px solid var(--border);
          color: var(--text-2);
          font-size: 13px; font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        body[data-mode="light"] .nt-quick-btn { background: rgba(255,255,255,.6); }
        .nt-quick-btn:hover:not(:disabled) {
          border-color: #4ade80;
          color: #4ade80;
          transform: translateY(-2px);
        }
        .nt-quick-btn.active {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 8px 22px rgba(34,197,94,.4);
          transform: translateY(-2px) scale(1.03);
        }
        .nt-quick-btn:disabled { opacity: .5; cursor: not-allowed; }

        .nt-submit {
          position: relative; width: 100%;
          padding: 18px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #fff; font-weight: 900; font-size: 15.5px;
          cursor: pointer; font-family: inherit;
          letter-spacing: -.2px; overflow: hidden;
          transition: all .4s cubic-bezier(.2,.7,.2,1);
          box-shadow: 0 12px 30px rgba(34,197,94,.4);
          margin-bottom: 14px;
        }
        .nt-submit:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 20px 45px rgba(34,197,94,.6);
        }
        .nt-submit:disabled { opacity: .6; cursor: not-allowed; }
        .nt-submit-shine {
          position: absolute; top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          transform: skewX(-20deg);
          animation: ntShine 3.5s infinite;
        }
        @keyframes ntShine {
          0%, 60% { left: -100%; }
          100% { left: 200%; }
        }

        .nt-hint {
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: var(--text-2);
          padding: 12px 16px; border-radius: 12px;
          background: rgba(167,139,250,.06);
          border: 1px solid rgba(167,139,250,.15);
        }

        /* RECENT */
        .nt-recent {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 14px;
        }
        .nt-recent-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,.02);
          border: 1px solid var(--border);
          transition: all .25s;
        }
        .nt-recent-item:hover {
          transform: translateX(4px);
          border-color: rgba(167,139,250,.4);
        }
        .nt-recent-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 900;
          flex-shrink: 0;
        }
        .nt-recent-info { flex: 1; min-width: 0; }
        .nt-recent-desc {
          font-size: 13.5px; font-weight: 700; color: var(--text-0);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nt-recent-time {
          font-size: 11px; color: var(--text-2);
          margin-top: 2px;
        }
        .nt-recent-amount {
          font-size: 14.5px; font-weight: 900;
          letter-spacing: -.3px;
        }
        .nt-recent-more {
          display: block; text-align: center;
          font-size: 13px; font-weight: 800;
          color: var(--accent-bright);
          text-decoration: none;
          padding: 10px;
          border-radius: 10px;
          background: rgba(167,139,250,.06);
          transition: all .25s;
        }
        .nt-recent-more:hover {
          background: rgba(167,139,250,.15);
          transform: translateY(-2px);
        }

        /* QR */
        .nt-qr-wrap {
          display: flex; flex-direction: column; gap: 18px;
          position: sticky; top: 90px;
        }

        .nt-timer {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 22px; border-radius: 18px;
          background: linear-gradient(135deg, rgba(251,191,36,.15), rgba(251,146,60,.08));
          border: 1px solid rgba(251,191,36,.3);
          position: relative; overflow: hidden;
        }
        .nt-timer::before {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,.1), transparent);
          animation: ntTimerShine 3s infinite;
        }
        @keyframes ntTimerShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .nt-timer-circle {
          position: relative; width: 60px; height: 60px;
          flex-shrink: 0;
        }
        .nt-timer-circle svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .nt-timer-text {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900;
          font-family: ui-monospace, monospace;
          color: #fbbf24;
        }
        .nt-timer-info { flex: 1; position: relative; }
        .nt-timer-label {
          font-size: 11px; color: #d97706;
          font-weight: 800; letter-spacing: .8px;
          text-transform: uppercase; margin-bottom: 4px;
        }
        .nt-timer-value {
          font-size: 24px; font-weight: 900;
          color: #fbbf24;
          font-family: ui-monospace, monospace;
          letter-spacing: 1.5px; line-height: 1;
        }

        .nt-tabs {
          display: flex; gap: 6px; padding: 5px;
          border-radius: 12px;
          background: rgba(0,0,0,.3);
          border: 1px solid rgba(167,139,250,.12);
        }
        .nt-tab {
          flex: 1;
          padding: 11px 16px; border-radius: 9px;
          border: none; background: transparent;
          color: #8b88a8; font-size: 13px; font-weight: 800;
          font-family: inherit; cursor: pointer;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        .nt-tab:hover { color: #c7c5db; }
        .nt-tab.active {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          box-shadow: 0 6px 18px rgba(124,58,237,.4);
        }

        .nt-qr-section {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          animation: ntSlideIn .4s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes ntSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nt-qr-wrap-inner {
          position: relative;
          padding: 20px; border-radius: 22px;
          background: #fff;
          box-shadow: 0 20px 50px rgba(0,0,0,.3);
        }
        .nt-qr-wrap-inner::before {
          content: "";
          position: absolute; inset: -4px;
          border-radius: 26px;
          background: conic-gradient(from 0deg, #4ade80, #a78bfa, #f472b6, #60a5fa, #4ade80);
          animation: ntQrRing 4s linear infinite;
          z-index: -1;
          filter: blur(8px);
        }
        @keyframes ntQrRing { to { transform: rotate(360deg); } }
        .nt-qr-brand {
          display: flex; align-items: center; justify-content: center;
          gap: 4px; font-size: 18px; font-weight: 900;
          margin-bottom: 12px;
        }
        .nt-qr-brand .viet { color: #ef4444; }
        .nt-qr-brand .qr { color: #3b82f6; }
        .nt-qr {
          width: 240px; height: 240px;
          border-radius: 16px; overflow: hidden;
        }
        .nt-qr img { width: 100%; height: 100%; }
        .nt-qr-hint {
          font-size: 13px; color: var(--text-2);
          text-align: center;
        }

        .nt-bank {
          border-radius: 18px;
          background: rgba(0,0,0,.3);
          border: 1px solid rgba(167,139,250,.15);
          overflow: hidden;
        }
        body[data-mode="light"] .nt-bank { background: rgba(255,255,255,.8); }
        .nt-bank-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; gap: 12px;
          border-bottom: 1px solid rgba(167,139,250,.08);
          transition: background .2s;
        }
        .nt-bank-row:last-child { border-bottom: none; }
        .nt-bank-row:hover { background: rgba(167,139,250,.05); }
        .nt-bank-label {
          font-size: 12.5px; color: var(--text-2);
          font-weight: 700; flex-shrink: 0;
        }
        .nt-bank-value {
          font-size: 14px; font-weight: 800;
          color: var(--text-0);
          display: flex; align-items: center; gap: 8px;
          min-width: 0;
        }
        .nt-bank-value span {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nt-copy {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(167,139,250,.12);
          border: 1px solid rgba(167,139,250,.25);
          color: #c4b5fd; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .25s cubic-bezier(.2,.7,.2,1);
          flex-shrink: 0;
          font-size: 13px;
        }
        .nt-copy:hover {
          background: rgba(167,139,250,.28);
          transform: scale(1.1);
          box-shadow: 0 6px 18px rgba(167,139,250,.4);
        }
        .nt-copy.copied {
          background: rgba(74,222,128,.2);
          border-color: rgba(74,222,128,.5);
          color: #4ade80;
        }

        .nt-status {
          padding: 16px 20px; border-radius: 16px;
          display: flex; align-items: center; gap: 12px;
          font-size: 13.5px; font-weight: 700;
          background: rgba(59,130,246,.1);
          border: 1px solid rgba(59,130,246,.3);
          color: #60a5fa;
          position: relative; overflow: hidden;
        }
        .nt-status::before {
          content: "";
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(96,165,250,.15), transparent);
          animation: ntStatusShine 2s infinite;
        }
        @keyframes ntStatusShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .nt-status-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 12px currentColor;
          animation: ntDotPulse 1.5s infinite;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        @keyframes ntDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.4); }
        }

        /* SUCCESS */
        .nt-success {
          text-align: center;
          padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          background: linear-gradient(145deg, rgba(74,222,128,.08), rgba(34,197,94,.02));
          border: 1.5px solid rgba(74,222,128,.3);
          border-radius: 24px;
          animation: ntSlideIn .5s cubic-bezier(.2,.7,.2,1);
        }
        .nt-success-icon {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          display: flex; align-items: center; justify-content: center;
          font-size: 52px;
          box-shadow: 0 25px 60px rgba(34,197,94,.5);
          animation: ntPopIn .6s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes ntPopIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(10deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .nt-success-title {
          font-size: 22px; font-weight: 900; color: #4ade80;
          letter-spacing: -.5px;
        }
        .nt-success-amount {
          font-size: 32px; font-weight: 900;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1.5px;
        }
        .nt-success-balance {
          font-size: 14px; color: var(--text-2);
        }
        .nt-success-balance strong {
          color: var(--text-0); font-weight: 900;
        }

        /* EXPIRED */
        .nt-expired {
          text-align: center;
          padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          background: rgba(251,191,36,.08);
          border: 1.5px solid rgba(251,191,36,.3);
          border-radius: 24px;
          animation: ntSlideIn .4s cubic-bezier(.2,.7,.2,1);
        }
        .nt-expired-icon {
          font-size: 72px;
          animation: ntFloat 3s ease-in-out infinite;
        }
        @keyframes ntFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .nt-expired-title {
          font-size: 20px; font-weight: 900; color: #fbbf24;
        }
        .nt-expired-desc {
          font-size: 14px; color: var(--text-2);
          max-width: 320px; line-height: 1.6;
        }

        .nt-btn-primary {
          padding: 14px 32px; border-radius: 14px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #fff; border: none; font-weight: 900;
          font-size: 14.5px; cursor: pointer;
          font-family: inherit;
          box-shadow: 0 10px 28px rgba(34,197,94,.4);
          transition: all .35s cubic-bezier(.2,.7,.2,1);
          margin-top: 8px;
        }
        .nt-btn-primary:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 18px 42px rgba(34,197,94,.6);
        }

        /* BACK TO TOP */
        .nt-back-top {
          position: fixed; bottom: 90px; left: 20px;
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 30px rgba(34,197,94,.5);
          z-index: 999;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
        }
        .nt-back-top:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 16px 40px rgba(34,197,94,.7);
        }
        @media (min-width: 768px) { .nt-back-top { bottom: 40px; } }

        /* CONFETTI */
        .nt-confetti {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 10000;
        }
        .nt-confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px; height: 10px;
          border-radius: 2px;
          opacity: 0;
          animation: ntConfettiFall 2.5s ease-out forwards;
        }
        @keyframes ntConfettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
        }

        /* TOAST */
        .nt-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 99999;
          padding: 14px 22px; border-radius: 14px;
          font-size: 13.5px; font-weight: 700;
          box-shadow: 0 12px 40px rgba(0,0,0,.5);
          animation: ntToastIn .35s cubic-bezier(.2,.7,.2,1);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 8px;
          max-width: 340px;
        }
        .nt-toast.success { background: rgba(34,197,94,.95); color: #fff; }
        .nt-toast.error { background: rgba(239,68,68,.95); color: #fff; }
        @keyframes ntToastIn {
          from { opacity: 0; transform: translateY(20px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .nt-hero { padding: 32px 16px; min-height: 260px; }
          .nt-balance { padding: 14px 24px; }
          .nt-balance-value { font-size: 26px; }
          .nt-card { padding: 20px; }
          .nt-qr { width: 200px; height: 200px; }
          .nt-input { font-size: 20px; padding: 18px 60px 18px 20px; }
          .nt-quick { gap: 8px; }
          .nt-quick-btn { padding: 10px 6px; font-size: 12px; }
        }
      `}</style>
    </>
  );
}