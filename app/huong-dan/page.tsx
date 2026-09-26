"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";   // ← THÊM DÒNG NÀY
import Footer from "@/components/Footer";

import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
const steps = [
  { n: 1, icon: "📝", title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí trên hệ thống để bắt đầu quá trình đồng bộ dữ liệu.", time: "30 giây", color: "#60a5fa" },
  { n: 2, icon: "🛒", title: "Chọn gói dịch vụ", desc: "Vào Bảng giá, chọn gói phù hợp với nhu cầu (GOLD, VIP, LUXURY, ANDROID).", time: "1 phút", color: "#a78bfa" },
  { n: 3, icon: "🔗", title: "Nhập username Locket", desc: "Cung cấp username hoặc link trang cá nhân Locket. Chúng tôi không cần mật khẩu.", time: "30 giây", color: "#f472b6" },
  { n: 4, icon: "💳", title: "Thanh toán", desc: "Quét mã QR bằng app ngân hàng để thanh toán. Hệ thống tự động xác nhận.", time: "1 phút", color: "#fb923c" },
  { n: 5, icon: "📦", title: "Nhận Profile", desc: "Sau khi thanh toán thành công, nhận Profile VIP và cài đặt theo hướng dẫn.", time: "1-2 phút", color: "#fbbf24" },
  { n: 6, icon: "🎉", title: "Tận hưởng GOLD", desc: "Mở Locket và tận hưởng toàn bộ tính năng Premium vĩnh viễn.", time: "Mãi mãi", color: "#4ade80" },
];

const faqs = [
  { q: "Tôi cần iCloud không?", a: "KHÔNG. Chúng tôi chỉ cần username hoặc link Locket công khai của bạn. Hoàn toàn không yêu cầu mật khẩu hay iCloud." },
  { q: "Có bị thu hồi Gold không?", a: "Hệ thống bảo hành 1 đổi 1 trọn đời. Nếu mất Gold do bất kỳ lý do nào, chúng tôi sẽ cấp lại ngay lập tức." },
  { q: "Hỗ trợ nền tảng nào?", a: "Cả iOS và Android. iOS dùng DNS, Android tải APK riêng do chúng tôi cung cấp. Hỗ trợ 24/7 qua Zalo và Telegram." },
  { q: "Bao lâu thì có Gold?", a: "Sau khi thanh toán thành công, hệ thống tự động xử lý trong 1-2 phút. Bạn sẽ nhận được thông báo ngay khi hoàn tất." },
  { q: "Có cần root máy không?", a: "Không. Android chỉ cần tải APK và đăng nhập. iOS chỉ cần cài cấu hình DNS. Hoàn toàn không can thiệp vào thiết bị." },
  { q: "Đổi máy mới thì sao?", a: "Hoàn toàn miễn phí. iOS cài lại DNS, Android tải lại APK. Liên hệ hỗ trợ nếu cần trợ giúp, xử lý trong vài phút." },
];

export default function HuongDanPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(scrolled);
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

    const particles: Array<{
      x: number; y: number; r: number; vx: number; vy: number; alpha: number; color: string;
    }> = [];

    const colors = ["#a78bfa", "#f472b6", "#60a5fa", "#4ade80", "#fbbf24"];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
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
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(anim);
    };
    anim();

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * 2;
      canvas.height = H * 2;
      ctx.scale(2, 2);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="guide-progress" style={{ transform: `scaleX(${progress / 100})` }} />

      <Header />

      <main className="wrap center-y" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="page-shell">
          {/* HERO */}
          <div className="guide-hero" data-reveal>
            <canvas ref={canvasRef} className="guide-hero-canvas" />
            <div className="guide-hero-content">
              <div className="guide-hero-badge">
                <span className="guide-hero-dot" />
                Hướng dẫn 2026
              </div>
              <h1 className="guide-hero-title">
                Chỉ 6 Bước Để Có{" "}
                <span className="guide-hero-gradient">Locket Gold</span>
              </h1>
              <p className="guide-hero-desc">
                Quy trình đơn giản, nhanh chóng — Hoàn tất trong chưa đầy 5 phút
              </p>
              <div className="guide-hero-stats">
                <div className="guide-hero-stat">
                  <span className="guide-hero-stat-num">6</span>
                  <span className="guide-hero-stat-label">Bước</span>
                </div>
                <div className="guide-hero-stat-divider" />
                <div className="guide-hero-stat">
                  <span className="guide-hero-stat-num">5p</span>
                  <span className="guide-hero-stat-label">Thời gian</span>
                </div>
                <div className="guide-hero-stat-divider" />
                <div className="guide-hero-stat">
                  <span className="guide-hero-stat-num">100%</span>
                  <span className="guide-hero-stat-label">An toàn</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEPS */}
          <div className="guide-steps-wrap">
            <div className="guide-timeline-line" />
            <div className="guide-steps">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className="guide-step"
                  data-reveal
                  style={{
                    animationDelay: `${i * 80}ms`,
                    ["--step-color" as any]: s.color,
                  }}
                >
                  <div className="guide-step-icon-wrap">
                    <div className="guide-step-icon-glow" />
                    <div className="guide-step-icon">{s.icon}</div>
                  </div>
                  <div className="guide-step-number">
                    <svg viewBox="0 0 44 44" className="guide-step-number-svg">
                      <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2"
                        strokeDasharray="125.6"
                        strokeDashoffset="125.6"
                        className="guide-step-number-ring"
                      />
                    </svg>
                    <span className="guide-step-number-text">{s.n}</span>
                  </div>
                  <div className="guide-step-body">
                    <div className="guide-step-head">
                      <h3 className="guide-step-title">{s.title}</h3>
                      <span className="guide-step-time">⏱ {s.time}</span>
                    </div>
                    <p className="guide-step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="guide-cta" data-reveal>
            <div className="guide-cta-glow" />
            <div className="guide-cta-glow-2" />
            <div className="guide-cta-content">
              <h2 className="guide-cta-title">Sẵn sàng nâng cấp Locket?</h2>
              <p className="guide-cta-desc">
                Chọn gói phù hợp và bắt đầu ngay — Hoàn tiền nếu không hài lòng
              </p>
              <div className="guide-cta-btns">
                <Link href="/bang-gia" className="guide-btn primary">
                  <span>💎 Xem bảng giá</span>
                  <span className="guide-btn-shine" />
                </Link>
                <a
                  href="https://zalo.me/0344421026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="guide-btn secondary"
                >
                  💬 Chat Zalo
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="guide-faq-section">
            <div className="guide-faq-head" data-reveal>
              <h2 className="guide-faq-title">Câu hỏi thường gặp</h2>
              <p className="guide-faq-sub">Giải đáp mọi thắc mắc trước khi mua</p>
            </div>

            <div className="guide-faq-list">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className={`guide-faq-item${openFaq === i ? " open" : ""}`}
                  data-reveal
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button
                    className="guide-faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="guide-faq-icon">?</span>
                    <span className="guide-faq-text">{f.q}</span>
                    <span className="guide-faq-chevron">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  <div className="guide-faq-a">
                    <div className="guide-faq-a-inner">{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Navbar />

      {/* Back to top */}
      {showTop && (
        <button
          className="guide-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      <style>{`
        /* ============ PROGRESS BAR ============ */
        .guide-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa);
          transform-origin: left;
          z-index: 9999;
          transition: transform .1s linear;
          box-shadow: 0 0 12px rgba(167,139,250,.6);
        }

        /* ============ SCROLL REVEAL ============ */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1);
        }
        [data-reveal].revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ============ HERO ============ */
        .guide-hero {
          position: relative;
          text-align: center;
          margin-bottom: 72px;
          padding: 40px 24px;
          border-radius: 28px;
          background: radial-gradient(ellipse at center top, rgba(167,139,250,.12), transparent 70%);
          overflow: hidden;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .guide-hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: .8;
        }
        .guide-hero-content {
          position: relative;
          z-index: 1;
        }
        .guide-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(167,139,250,.15), rgba(244,114,182,.1));
          border: 1px solid rgba(167,139,250,.3);
          font-size: 12px;
          font-weight: 700;
          color: var(--accent-bright);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        .guide-hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-bright);
          box-shadow: 0 0 12px var(--accent-bright);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.3); }
        }
        .guide-hero-title {
          font-size: clamp(30px, 5vw, 52px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--text-0);
          margin-bottom: 16px;
          text-wrap: balance;
        }
        .guide-hero-gradient {
          background: linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa, #a78bfa);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 6s ease infinite;
          display: inline-block;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .guide-hero-desc {
          font-size: 15.5px;
          color: var(--text-2);
          max-width: 560px;
          margin: 0 auto 28px;
        }
        .guide-hero-stats {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          padding: 16px 32px;
          border-radius: 20px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(167,139,250,.15);
          backdrop-filter: blur(10px);
        }
        body[data-mode="light"] .guide-hero-stats { background: rgba(255,255,255,.7); }
        .guide-hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .guide-hero-stat-num {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(135deg, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -.5px;
        }
        .guide-hero-stat-label {
          font-size: 11px;
          color: var(--text-2);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .guide-hero-stat-divider {
          width: 1px;
          height: 32px;
          background: rgba(167,139,250,.2);
        }
        @media (max-width: 640px) {
          .guide-hero { padding: 32px 16px; min-height: 280px; }
          .guide-hero-stats { padding: 12px 20px; gap: 16px; }
          .guide-hero-stat-num { font-size: 18px; }
          .guide-hero-stat-label { font-size: 10px; }
        }

        /* ============ STEPS ============ */
        .guide-steps-wrap {
          position: relative;
          max-width: 860px;
          margin: 0 auto 72px;
          padding: 20px 0;
        }
        .guide-timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, rgba(167,139,250,.3) 15%, rgba(167,139,250,.3) 85%, transparent);
          transform: translateX(-50%);
          z-index: 0;
        }
        .guide-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 1;
        }
        .guide-step {
          display: grid;
          grid-template-columns: 60px 48px 1fr;
          gap: 18px;
          align-items: flex-start;
          padding: 24px 28px;
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.01));
          border: 1px solid var(--border);
          position: relative;
          transition: all .5s cubic-bezier(.2,.7,.2,1);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        body[data-mode="light"] .guide-step {
          background: linear-gradient(145deg, rgba(255,255,255,.95), rgba(255,255,255,.75));
        }
        .guide-step::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1.5px;
          background: linear-gradient(135deg, transparent 30%, var(--step-color), transparent 70%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .5s;
          pointer-events: none;
        }
        .guide-step::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,.04) 50%, transparent 60%);
          transform: translateX(-100%) rotate(0deg);
          transition: transform 1s;
          pointer-events: none;
        }
        .guide-step:hover::before { opacity: 1; }
        .guide-step:hover::after { transform: translateX(100%) rotate(0deg); }
        .guide-step:hover {
          transform: translateX(8px) scale(1.01);
          border-color: var(--step-color);
          box-shadow: 0 24px 60px rgba(0,0,0,.3), 0 0 40px -10px var(--step-color);
        }
        body[data-mode="light"] .guide-step:hover {
          box-shadow: 0 20px 50px rgba(124,58,237,.15), 0 0 40px -10px var(--step-color);
        }

        .guide-step-icon-wrap {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        .guide-step-icon-glow {
          position: absolute;
          inset: -8px;
          border-radius: 20px;
          background: radial-gradient(circle, var(--step-color), transparent 70%);
          opacity: 0;
          filter: blur(12px);
          transition: opacity .5s;
        }
        .guide-step:hover .guide-step-icon-glow { opacity: .5; }
        .guide-step-icon {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border: 1.5px solid var(--step-color);
          transition: transform .5s cubic-bezier(.2,.7,.2,1);
          box-shadow: 0 8px 24px -8px var(--step-color);
        }
        .guide-step:hover .guide-step-icon {
          transform: scale(1.15) rotate(-8deg);
        }

        .guide-step-number {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .guide-step-number-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .guide-step-number-ring {
          transition: stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1);
        }
        .guide-step.revealed .guide-step-number-ring {
          stroke-dashoffset: 0;
        }
        .guide-step-number-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 900;
          color: var(--step-color);
        }

        .guide-step-body {
          min-width: 0;
          padding-top: 6px;
        }
        .guide-step-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .guide-step-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-0);
          letter-spacing: -.3px;
          margin: 0;
        }
        .guide-step-time {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--step-color);
          padding: 4px 10px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--step-color) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--step-color) 30%, transparent);
          white-space: nowrap;
        }
        .guide-step-desc {
          font-size: 14.5px;
          color: var(--text-2);
          line-height: 1.65;
          margin: 0;
        }

        @media (max-width: 640px) {
          .guide-timeline-line { left: 30px; }
          .guide-step {
            grid-template-columns: 48px 1fr;
            gap: 14px;
            padding: 18px;
          }
          .guide-step-icon-wrap { width: 48px; height: 48px; }
          .guide-step-icon { width: 48px; height: 48px; font-size: 22px; border-radius: 14px; }
          .guide-step-number {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
          }
          .guide-step-number-text { font-size: 12px; }
          .guide-step-body { grid-column: 2 / -1; padding-top: 0; }
          .guide-step-title { font-size: 16px; }
        }

        /* ============ CTA ============ */
        .guide-cta {
          position: relative;
          text-align: center;
          padding: 64px 28px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(167,139,250,.12), rgba(244,114,182,.06));
          border: 1px solid rgba(167,139,250,.3);
          margin-bottom: 72px;
          overflow: hidden;
          isolation: isolate;
        }
        .guide-cta-glow,
        .guide-cta-glow-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: -1;
        }
        .guide-cta-glow {
          top: -50%;
          left: 20%;
          width: 60%;
          height: 200%;
          background: radial-gradient(circle, rgba(167,139,250,.4), transparent 60%);
          animation: float-glow 8s ease-in-out infinite;
        }
        .guide-cta-glow-2 {
          bottom: -50%;
          right: 20%;
          width: 50%;
          height: 180%;
          background: radial-gradient(circle, rgba(244,114,182,.3), transparent 60%);
          animation: float-glow 8s ease-in-out infinite reverse;
        }
        @keyframes float-glow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.1); }
        }
        .guide-cta-content { position: relative; z-index: 1; }
        .guide-cta-title {
          font-size: clamp(24px, 3.5vw, 34px);
          font-weight: 900;
          color: var(--text-0);
          letter-spacing: -1.2px;
          margin-bottom: 12px;
        }
        .guide-cta-desc {
          font-size: 15.5px;
          color: var(--text-2);
          margin-bottom: 32px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .guide-cta-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .guide-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: all .4s cubic-bezier(.2,.7,.2,1);
          letter-spacing: -.2px;
          overflow: hidden;
          border: none;
        }
        .guide-btn.primary {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          box-shadow: 0 10px 30px rgba(124,58,237,.5), inset 0 1px 0 rgba(255,255,255,.2);
        }
        .guide-btn.primary:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 18px 42px rgba(124,58,237,.7), inset 0 1px 0 rgba(255,255,255,.3);
        }
        .guide-btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          transform: skewX(-20deg);
          animation: shine-sweep 3.5s infinite;
        }
        @keyframes shine-sweep {
          0%, 60% { left: -100%; }
          100% { left: 200%; }
        }
        .guide-btn.secondary {
          background: rgba(255,255,255,.05);
          border: 1.5px solid rgba(167,139,250,.3);
          color: var(--text-0);
          backdrop-filter: blur(10px);
        }
        .guide-btn.secondary:hover {
          background: rgba(167,139,250,.12);
          border-color: rgba(167,139,250,.6);
          transform: translateY(-3px) scale(1.03);
        }

        /* ============ FAQ ============ */
        .guide-faq-section {
          max-width: 860px;
          margin: 0 auto;
        }
        .guide-faq-head {
          text-align: center;
          margin-bottom: 36px;
        }
        .guide-faq-title {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -1.2px;
          color: var(--text-0);
          margin-bottom: 10px;
        }
        .guide-faq-sub {
          font-size: 14.5px;
          color: var(--text-2);
        }
        .guide-faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .guide-faq-item {
          border-radius: 18px;
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all .4s cubic-bezier(.2,.7,.2,1);
        }
        body[data-mode="light"] .guide-faq-item { background: rgba(255,255,255,.8); }
        .guide-faq-item:hover { border-color: rgba(167,139,250,.4); }
        .guide-faq-item.open {
          border-color: rgba(167,139,250,.6);
          box-shadow: 0 20px 50px -12px rgba(124,58,237,.35), 0 0 30px -10px rgba(167,139,250,.4);
          background: rgba(167,139,250,.04);
        }
        body[data-mode="light"] .guide-faq-item.open { background: rgba(167,139,250,.06); }
        .guide-faq-q {
          width: 100%;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          color: var(--text-0);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -.2px;
          transition: color .3s;
        }
        .guide-faq-item.open .guide-faq-q { color: var(--accent-bright); }
        .guide-faq-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(167,139,250,.12);
          color: var(--accent-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          flex-shrink: 0;
          transition: all .5s cubic-bezier(.2,.7,.2,1);
          font-size: 15px;
        }
        .guide-faq-item.open .guide-faq-icon {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          transform: rotate(360deg) scale(1.1);
          box-shadow: 0 8px 22px rgba(124,58,237,.5);
        }
        .guide-faq-text { flex: 1; }
        .guide-faq-chevron {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-2);
          transition: all .4s cubic-bezier(.2,.7,.2,1);
          flex-shrink: 0;
        }
        .guide-faq-item.open .guide-faq-chevron {
          transform: rotate(180deg);
          background: var(--accent);
          color: #fff;
          box-shadow: 0 6px 18px rgba(124,58,237,.4);
        }
        .guide-faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height .5s cubic-bezier(.2,.7,.2,1);
        }
        .guide-faq-item.open .guide-faq-a { max-height: 500px; }
        .guide-faq-a-inner {
          padding: 0 26px 24px 76px;
          font-size: 14.5px;
          color: var(--text-1);
          line-height: 1.75;
          text-align: left;
          animation: fade-in-up .4s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .guide-faq-q { padding: 18px 20px; font-size: 15px; gap: 12px; }
          .guide-faq-icon { width: 30px; height: 30px; font-size: 13px; }
          .guide-faq-a-inner { padding: 0 20px 20px 62px; font-size: 13.5px; }
        }

        /* ============ BACK TO TOP ============ */
        .guide-back-top {
          position: fixed;
          bottom: 90px;
          left: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(124,58,237,.5);
          z-index: 999;
          transition: all .3s cubic-bezier(.2,.7,.2,1);
          animation: fade-in-up .4s cubic-bezier(.2,.7,.2,1);
        }
        .guide-back-top:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 16px 40px rgba(124,58,237,.7);
        }
        @media (min-width: 768px) {
          .guide-back-top { bottom: 40px; }
        }
      `}</style>
    </>
  );
}