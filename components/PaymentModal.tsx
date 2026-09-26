"use client";

import { useEffect, useRef, useState } from "react";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  locketUsername: string;
  status: string;
  expiresAt: string | null;
}

interface Props {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const BANK = {
  name: "TPBank",
  accountNo: "36886368888",
  accountName: "TRAN NHAT PHUC",
};

export default function PaymentModal({ order, onClose, onSuccess }: Props) {
  const [qrUrl, setQrUrl] = useState("");
  const [countdown, setCountdown] = useState(900);
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);
  const [creating, setCreating] = useState(true);
  const [activeTab, setActiveTab] = useState<"qr" | "manual">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Tạo QR
  useEffect(() => {
    if (!order.id) return;
    setCreating(true);
    fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.qrUrl) setQrUrl(d.qrUrl);
        else showToast("error", d.message || "Không tạo được QR");
      })
      .catch(() => showToast("error", "Lỗi kết nối"))
      .finally(() => setCreating(false));
  }, [order.id]);

  // Countdown
  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setStatus("expired");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // Polling
  useEffect(() => {
    if (status !== "pending" || !order.id) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/payments/check?orderId=${order.id}`);
        const d = await r.json();
        if (d.status === "paid") {
          setStatus("paid");
          showToast("success", "Thanh toán thành công!");
          setTimeout(() => onSuccess(), 2500);
        } else if (d.status === "expired" || d.status === "cancelled") {
          setStatus("expired");
        }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [status, order.id, onSuccess]);

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
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number }> = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.4 + 0.1,
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
        ctx.fillStyle = "#a78bfa";
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(anim);
    };
    anim();
    return () => cancelAnimationFrame(raf);
  }, []);

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

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const progress = countdown / 900;

  // Circular progress
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <>
      <style>{`
        /* ============ OVERLAY ============ */
        .pm2-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,.8);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; overflow-y: auto;
          animation: pm2Fade .3s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes pm2Fade { from { opacity: 0; } to { opacity: 1; } }

        .pm2-canvas {
          position: fixed; inset: 0;
          pointer-events: none; opacity: .6;
        }

        /* ============ MODAL ============ */
        .pm2-modal {
          position: relative;
          width: 100%; max-width: 580px;
          background: linear-gradient(180deg, #14142a, #0f0f1f);
          border: 1px solid rgba(167,139,250,.25);
          border-radius: 26px;
          box-shadow: 0 40px 100px rgba(0,0,0,.9), 0 0 80px -20px rgba(167,139,250,.5);
          overflow: hidden;
          animation: pm2In .5s cubic-bezier(.2,.7,.2,1);
          display: flex; flex-direction: column;
          max-height: 94vh;
        }
        @keyframes pm2In {
          from { opacity: 0; transform: translateY(30px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pm2-modal::before {
          content: "";
          position: absolute; inset: 0; border-radius: 26px; padding: 1.5px;
          background: linear-gradient(135deg, transparent 30%, rgba(167,139,250,.5), transparent 70%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none; z-index: 2;
        }

        /* ============ HEAD ============ */
        .pm2-head {
          padding: 22px 26px;
          border-bottom: 1px solid rgba(167,139,250,.12);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; position: relative;
        }
        .pm2-head-left { display: flex; align-items: center; gap: 12px; }
        .pm2-head-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 10px 26px rgba(124,58,237,.5);
          animation: pm2IconPulse 2.5s ease-in-out infinite;
        }
        @keyframes pm2IconPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 26px rgba(124,58,237,.5); }
          50% { transform: scale(1.05); box-shadow: 0 14px 34px rgba(124,58,237,.7); }
        }
        .pm2-title {
          font-size: 17px; font-weight: 900;
          color: #f5f5ff; letter-spacing: -.3px;
          margin-bottom: 3px;
        }
        .pm2-sub {
          font-size: 12px; color: #8b88a8;
          font-family: ui-monospace, monospace;
          letter-spacing: .3px;
        }
        .pm2-close {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: #c7c5db; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .25s cubic-bezier(.2,.7,.2,1);
        }
        .pm2-close:hover {
          background: rgba(239,68,68,.2);
          color: #f87171;
          border-color: rgba(239,68,68,.4);
          transform: rotate(90deg) scale(1.05);
        }

        /* ============ BODY ============ */
        .pm2-body {
          padding: 24px;
          overflow-y: auto;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }

        /* ============ TIMER ============ */
        .pm2-timer {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 22px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(251,191,36,.15), rgba(251,146,60,.08));
          border: 1px solid rgba(251,191,36,.3);
          position: relative; overflow: hidden;
        }
        .pm2-timer::before {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,.1), transparent);
          animation: pm2TimerShine 3s infinite;
        }
        @keyframes pm2TimerShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .pm2-timer-circle {
          position: relative;
          width: 60px; height: 60px;
          flex-shrink: 0;
        }
        .pm2-timer-circle svg {
          width: 100%; height: 100%;
          transform: rotate(-90deg);
        }
        .pm2-timer-circle-text {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900;
          font-family: ui-monospace, monospace;
          color: #fbbf24;
        }
        .pm2-timer-info { flex: 1; position: relative; }
        .pm2-timer-label {
          font-size: 11px; color: #d97706;
          font-weight: 800; letter-spacing: .8px;
          text-transform: uppercase; margin-bottom: 4px;
        }
        .pm2-timer-value {
          font-size: 26px; font-weight: 900;
          color: #fbbf24;
          font-family: ui-monospace, monospace;
          letter-spacing: 1.5px;
          line-height: 1;
        }

        /* ============ AMOUNT ============ */
        .pm2-amount {
          text-align: center;
          padding: 22px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(167,139,250,.12), rgba(244,114,182,.06));
          border: 1px solid rgba(167,139,250,.25);
          position: relative; overflow: hidden;
        }
        .pm2-amount::before {
          content: "";
          position: absolute; top: -50%; left: 50%;
          transform: translateX(-50%);
          width: 80%; height: 200%;
          background: radial-gradient(ellipse, rgba(167,139,250,.25), transparent 60%);
          filter: blur(40px);
          animation: pm2AmountGlow 4s ease-in-out infinite;
        }
        @keyframes pm2AmountGlow {
          0%, 100% { opacity: .5; transform: translateX(-50%) scale(1); }
          50% { opacity: .8; transform: translateX(-50%) scale(1.1); }
        }
        .pm2-amount-label {
          position: relative;
          font-size: 11.5px; color: #8b88a8;
          font-weight: 800; letter-spacing: 1.2px;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .pm2-amount-value {
          position: relative;
          font-size: 40px; font-weight: 900;
          background: linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa);
          background-size: 200% 200%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -2px;
          line-height: 1;
          animation: pm2AmountGradient 4s ease infinite;
        }
        @keyframes pm2AmountGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .pm2-amount-service {
          position: relative;
          margin-top: 8px;
          font-size: 13px; color: #c7c5db;
          font-weight: 700;
        }

        /* ============ TABS ============ */
        .pm2-tabs {
          display: flex; gap: 6px;
          padding: 5px;
          border-radius: 12px;
          background: rgba(0,0,0,.3);
          border: 1px solid rgba(167,139,250,.12);
        }
        .pm2-tab {
          flex: 1;
          padding: 11px 16px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: #8b88a8;
          font-size: 13px; font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .pm2-tab:hover { color: #c7c5db; }
        .pm2-tab.active {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          box-shadow: 0 6px 18px rgba(124,58,237,.4);
        }

        /* ============ QR ============ */
        .pm2-qr-section {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          animation: pm2SlideIn .4s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes pm2SlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pm2-qr-wrap {
          position: relative;
          padding: 20px;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 20px 50px rgba(0,0,0,.3);
        }
        .pm2-qr-wrap::before {
          content: "";
          position: absolute; inset: -4px;
          border-radius: 26px;
          background: conic-gradient(from 0deg, #a78bfa, #f472b6, #60a5fa, #4ade80, #fbbf24, #a78bfa);
          animation: pm2QrRing 4s linear infinite;
          z-index: -1;
          filter: blur(8px);
        }
        @keyframes pm2QrRing {
          to { transform: rotate(360deg); }
        }
        .pm2-qr-brand {
          display: flex; align-items: center; justify-content: center;
          gap: 4px;
          font-size: 18px; font-weight: 900;
          margin-bottom: 12px;
        }
        .pm2-qr-brand .viet { color: #ef4444; }
        .pm2-qr-brand .qr { color: #3b82f6; }
        .pm2-qr {
          width: 240px; height: 240px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .pm2-qr img { width: 100%; height: 100%; border-radius: 16px; }
        .pm2-qr-loading {
          width: 240px; height: 240px;
          border-radius: 16px;
          background: linear-gradient(90deg, #f3f3f3 25%, #e9e9e9 50%, #f3f3f3 75%);
          background-size: 200% 100%;
          animation: pm2Shimmer 1.5s infinite;
        }
        @keyframes pm2Shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .pm2-qr-hint {
          font-size: 13px; color: #8b88a8;
          text-align: center;
          display: flex; align-items: center; gap: 6px;
        }

        /* ============ BANK INFO ============ */
        .pm2-bank {
          border-radius: 18px;
          background: rgba(0,0,0,.3);
          border: 1px solid rgba(167,139,250,.15);
          overflow: hidden;
          animation: pm2SlideIn .4s cubic-bezier(.2,.7,.2,1);
        }
        .pm2-bank-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 18px;
          gap: 12px;
          border-bottom: 1px solid rgba(167,139,250,.08);
          transition: background .25s;
        }
        .pm2-bank-row:last-child { border-bottom: none; }
        .pm2-bank-row:hover { background: rgba(167,139,250,.05); }
        .pm2-bank-label {
          font-size: 12.5px; color: #8b88a8;
          font-weight: 700; flex-shrink: 0;
        }
        .pm2-bank-value {
          font-size: 14px; font-weight: 800;
          color: #f5f5ff;
          display: flex; align-items: center; gap: 8px;
          text-align: right;
          min-width: 0;
        }
        .pm2-bank-value span {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pm2-copy {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(167,139,250,.12);
          border: 1px solid rgba(167,139,250,.25);
          color: #c4b5fd; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .25s cubic-bezier(.2,.7,.2,1);
          flex-shrink: 0;
          font-size: 13px;
        }
        .pm2-copy:hover {
          background: rgba(167,139,250,.28);
          transform: scale(1.1);
          box-shadow: 0 6px 18px rgba(167,139,250,.4);
        }
        .pm2-copy.copied {
          background: rgba(74,222,128,.2);
          border-color: rgba(74,222,128,.5);
          color: #4ade80;
        }

        /* ============ STATUS ============ */
        .pm2-status {
          padding: 16px 20px;
          border-radius: 16px;
          display: flex; align-items: center; gap: 12px;
          font-size: 13.5px; font-weight: 700;
          position: relative; overflow: hidden;
        }
        .pm2-status-pending {
          background: rgba(59,130,246,.1);
          border: 1px solid rgba(59,130,246,.3);
          color: #60a5fa;
        }
        .pm2-status-pending::before {
          content: "";
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(96,165,250,.15), transparent);
          animation: pm2StatusShine 2s infinite;
        }
        @keyframes pm2StatusShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .pm2-status-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 12px currentColor;
          animation: pm2DotPulse 1.5s infinite;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        @keyframes pm2DotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.4); }
        }
        .pm2-status-text { position: relative; z-index: 1; }

        /* ============ SUCCESS ============ */
        .pm2-success {
          text-align: center;
          padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          animation: pm2SlideIn .5s cubic-bezier(.2,.7,.2,1);
        }
        .pm2-success-icon {
          width: 110px; height: 110px; border-radius: 50%;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          display: flex; align-items: center; justify-content: center;
          font-size: 56px;
          box-shadow: 0 25px 60px rgba(34,197,94,.5), inset 0 -4px 8px rgba(0,0,0,.15);
          animation: pm2PopIn .6s cubic-bezier(.2,.7,.2,1);
          position: relative;
        }
        .pm2-success-icon::before {
          content: "";
          position: absolute; inset: -12px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(74,222,128,.4), transparent 70%);
          animation: pm2SuccessPulse 2s infinite;
          z-index: -1;
        }
        @keyframes pm2SuccessPulse {
          0%, 100% { transform: scale(1); opacity: .6; }
          50% { transform: scale(1.2); opacity: .3; }
        }
        @keyframes pm2PopIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(10deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .pm2-success-title {
          font-size: 24px; font-weight: 900;
          color: #4ade80;
          letter-spacing: -.5px;
        }
        .pm2-success-desc {
          font-size: 14px; color: #8b88a8;
          line-height: 1.6;
          max-width: 380px;
        }
        .pm2-success-redirect {
          font-size: 12.5px; color: #a78bfa;
          font-weight: 700;
          display: flex; align-items: center; gap: 6px;
          margin-top: 8px;
        }
        .pm2-success-redirect::after {
          content: "";
          width: 12px; height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(167,139,250,.3);
          border-top-color: #a78bfa;
          animation: pm2Spin 1s linear infinite;
        }
        @keyframes pm2Spin { to { transform: rotate(360deg); } }

        /* ============ EXPIRED ============ */
        .pm2-expired {
          text-align: center;
          padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          animation: pm2SlideIn .4s cubic-bezier(.2,.7,.2,1);
        }
        .pm2-expired-icon {
          font-size: 72px;
          animation: pm2Float 3s ease-in-out infinite;
        }
        @keyframes pm2Float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .pm2-expired-title {
          font-size: 20px; font-weight: 900;
          color: #fbbf24;
        }
        .pm2-expired-desc {
          font-size: 14px; color: #8b88a8;
          max-width: 320px; line-height: 1.6;
        }

        /* ============ BTN ============ */
        .pm2-btn {
          padding: 14px 30px; border-radius: 14px;
          font-size: 14.5px; font-weight: 900;
          border: none; cursor: pointer;
          font-family: inherit;
          transition: all .35s cubic-bezier(.2,.7,.2,1);
          display: inline-flex; align-items: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .pm2-btn-primary {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          box-shadow: 0 10px 28px rgba(124,58,237,.5);
        }
        .pm2-btn-primary::after {
          content: "";
          position: absolute; top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          transform: skewX(-20deg);
          animation: pm2Shine 3.5s infinite;
        }
        @keyframes pm2Shine {
          0%, 60% { left: -100%; }
          100% { left: 200%; }
        }
        .pm2-btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 18px 42px rgba(124,58,237,.7);
        }

        /* ============ CONFETTI ============ */
        .pm2-confetti {
          position: fixed; inset: 0;
          pointer-events: none;
          z-index: 10000;
        }
        .pm2-confetti-piece {
          position: absolute;
          width: 10px; height: 10px;
          opacity: 0;
          animation: pm2ConfettiFall 3s ease-out forwards;
        }
        @keyframes pm2ConfettiFall {
          0% {
            opacity: 1;
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(110vh) rotate(720deg);
          }
        }

        /* ============ TOAST ============ */
        .pm2-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 99999;
          padding: 14px 22px; border-radius: 14px;
          font-size: 13.5px; font-weight: 700;
          box-shadow: 0 12px 40px rgba(0,0,0,.5);
          animation: pm2ToastIn .35s cubic-bezier(.2,.7,.2,1);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 8px;
        }
        .pm2-toast.success { background: rgba(34,197,94,.95); color: #fff; }
        .pm2-toast.error { background: rgba(239,68,68,.95); color: #fff; }
        @keyframes pm2ToastIn {
          from { opacity: 0; transform: translateY(20px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .pm2-modal { border-radius: 22px; }
          .pm2-head, .pm2-body { padding: 20px; }
          .pm2-qr, .pm2-qr-loading { width: 200px; height: 200px; }
          .pm2-amount-value { font-size: 32px; }
          .pm2-timer-value { font-size: 22px; }
          .pm2-bank-value { font-size: 13px; }
          .pm2-bank-label { font-size: 11.5px; }
        }
      `}</style>

      <div className="pm2-overlay" onClick={onClose}>
        <canvas ref={canvasRef} className="pm2-canvas" />
        <div className="pm2-modal" onClick={(e) => e.stopPropagation()}>
          {/* HEAD */}
          <div className="pm2-head">
            <div className="pm2-head-left">
              <div className="pm2-head-icon">💳</div>
              <div>
                <div className="pm2-title">Thanh toán đơn hàng</div>
                <div className="pm2-sub">#{order.orderCode}</div>
              </div>
            </div>
            <button className="pm2-close" onClick={onClose} aria-label="Đóng">✕</button>
          </div>

          {/* BODY */}
          <div className="pm2-body">
            {status === "paid" ? (
              <div className="pm2-success">
                <div className="pm2-success-icon">🎉</div>
                <div className="pm2-success-title">Thanh toán thành công!</div>
                <div className="pm2-success-desc">
                  Đơn hàng <strong style={{ color: "#a78bfa" }}>#{order.orderCode}</strong> đã được xác nhận.
                  <br />Hệ thống đang xử lý và sẽ cập nhật trạng thái trong thời gian sớm nhất.
                </div>
                <div className="pm2-success-redirect">Đang chuyển trang</div>
              </div>
            ) : status === "expired" ? (
              <div className="pm2-expired">
                <div className="pm2-expired-icon">⏰</div>
                <div className="pm2-expired-title">Đơn hàng đã hết hạn</div>
                <div className="pm2-expired-desc">
                  Thời gian thanh toán đã kết thúc. Vui lòng tạo đơn hàng mới để tiếp tục.
                </div>
                <button className="pm2-btn pm2-btn-primary" onClick={onClose}>
                  🔄 Tạo đơn mới
                </button>
              </div>
            ) : (
              <>
                {/* TIMER */}
                <div className="pm2-timer">
                  <div className="pm2-timer-circle">
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
                    <div className="pm2-timer-circle-text">{timeStr}</div>
                  </div>
                  <div className="pm2-timer-info">
                    <div className="pm2-timer-label">Thời gian còn lại</div>
                    <div className="pm2-timer-value">{timeStr}</div>
                  </div>
                </div>

                {/* AMOUNT */}
                <div className="pm2-amount">
                  <div className="pm2-amount-label">Số tiền cần thanh toán</div>
                  <div className="pm2-amount-value">
                    {order.finalAmount.toLocaleString("vi-VN")}đ
                  </div>
                  <div className="pm2-amount-service">{order.serviceName}</div>
                </div>

                {/* TABS */}
                <div className="pm2-tabs">
                  <button
                    className={`pm2-tab${activeTab === "qr" ? " active" : ""}`}
                    onClick={() => setActiveTab("qr")}
                  >
                    📱 Quét QR
                  </button>
                  <button
                    className={`pm2-tab${activeTab === "manual" ? " active" : ""}`}
                    onClick={() => setActiveTab("manual")}
                  >
                    💳 Chuyển khoản
                  </button>
                </div>

                {/* QR TAB */}
                {activeTab === "qr" && (
                  <div className="pm2-qr-section">
                    <div className="pm2-qr-wrap">
                      <div className="pm2-qr-brand">
                        <span className="viet">Viet</span>
                        <span className="qr">QR</span>
                      </div>
                      <div className="pm2-qr">
                        {creating || !qrUrl ? (
                          <div className="pm2-qr-loading" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={qrUrl} alt="QR thanh toán" />
                        )}
                      </div>
                    </div>
                    <div className="pm2-qr-hint">
                      📸 Mở app ngân hàng và quét mã QR để thanh toán
                    </div>
                  </div>
                )}

                {/* MANUAL TAB */}
                {activeTab === "manual" && (
                  <div className="pm2-bank">
                    <div className="pm2-bank-row">
                      <span className="pm2-bank-label">Ngân hàng</span>
                      <span className="pm2-bank-value"><span>{BANK.name}</span></span>
                    </div>
                    <div className="pm2-bank-row">
                      <span className="pm2-bank-label">Số tài khoản</span>
                      <span className="pm2-bank-value">
                        <span>{BANK.accountNo}</span>
                        <button
                          className={`pm2-copy${copiedField === "STK" ? " copied" : ""}`}
                          onClick={() => copy(BANK.accountNo, "STK")}
                          title="Copy số tài khoản"
                        >
                          {copiedField === "STK" ? "✓" : "📋"}
                        </button>
                      </span>
                    </div>
                    <div className="pm2-bank-row">
                      <span className="pm2-bank-label">Chủ tài khoản</span>
                      <span className="pm2-bank-value"><span>{BANK.accountName}</span></span>
                    </div>
                    <div className="pm2-bank-row">
                      <span className="pm2-bank-label">Số tiền</span>
                      <span className="pm2-bank-value" style={{ color: "#4ade80" }}>
                        <span>{order.finalAmount.toLocaleString("vi-VN")}đ</span>
                        <button
                          className={`pm2-copy${copiedField === "số tiền" ? " copied" : ""}`}
                          onClick={() => copy(String(order.finalAmount), "số tiền")}
                          title="Copy số tiền"
                        >
                          {copiedField === "số tiền" ? "✓" : "📋"}
                        </button>
                      </span>
                    </div>
                    <div className="pm2-bank-row">
                      <span className="pm2-bank-label">Nội dung</span>
                      <span className="pm2-bank-value">
                        <span>{order.orderCode}</span>
                        <button
                          className={`pm2-copy${copiedField === "nội dung" ? " copied" : ""}`}
                          onClick={() => copy(order.orderCode, "nội dung")}
                          title="Copy nội dung"
                        >
                          {copiedField === "nội dung" ? "✓" : "📋"}
                        </button>
                      </span>
                    </div>
                  </div>
                )}

                {/* STATUS */}
                <div className="pm2-status pm2-status-pending">
                  <div className="pm2-status-dot" />
                  <span className="pm2-status-text">
                    Đang chờ thanh toán... Hệ thống tự động xác nhận sau 1-2 phút
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`pm2-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"}
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
