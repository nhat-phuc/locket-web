"use client";

import { useEffect, useState } from "react";

export default function LienHePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setName(u.name || u.username || "");
        setEmail(u.email || "");
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) { setSubject(""); setMessage(""); }
    } catch {
      setResult({ success: false, message: "Lỗi kết nối" });
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { icon: "💬", label: "Zalo", value: "0344 421 026", href: "https://zalo.me/0344421026", gradient: "linear-gradient(135deg,#0068FF,#00A3FF)" },
    { icon: "📢", label: "Telegram", value: "@hethonglocket", href: "https://t.me/hethonglocket", gradient: "linear-gradient(135deg,#0088cc,#00b4ff)" },
    { icon: "📧", label: "Email", value: "support@locketgold.app", href: "mailto:support@locketgold.app", gradient: "linear-gradient(135deg,#EA4335,#ff6b5b)" },
    { icon: "🌐", label: "Website", value: "locketgold.app", href: "https://locketgold.app", gradient: "linear-gradient(135deg,#a78bfa,#ec4899)" },
  ];

  return (
    <>
      <main className="ct-page">
        {/* Animated background */}
        <div className="ct-orb ct-orb-1" />
        <div className="ct-orb ct-orb-2" />
        <div className="ct-orb ct-orb-3" />
        <div className="ct-grid-bg" />

        <div className="ct-wrap">
          {/* Hero */}
          <div className="ct-hero">
            <div className="ct-badge">
              <span className="ct-badge-dot" />
              Hỗ trợ 24/7 — Phản hồi trong 24h
            </div>
            <h1 className="ct-h1">
              Liên hệ <span className="ct-gradient">Locket Gold</span>
            </h1>
            <p className="ct-sub">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Chọn kênh liên hệ hoặc gửi tin nhắn trực tiếp.
            </p>
          </div>

          <div className="ct-grid">
            {/* LEFT */}
            <div className="ct-side">
              <div className="ct-card ct-card-info">
                <div className="ct-card-head">
                  <div className="ct-card-icon">📞</div>
                  <div>
                    <h2>Kênh hỗ trợ</h2>
                    <p>Chọn cách liên hệ nhanh nhất</p>
                  </div>
                </div>

                <div className="ct-channels">
                  {channels.map((c, i) => (
                    <a
                      key={i}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ct-channel"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="ct-channel-icon" style={{ background: c.gradient }}>
                        {c.icon}
                      </div>
                      <div className="ct-channel-body">
                        <div className="ct-channel-label">{c.label}</div>
                        <div className="ct-channel-value">{c.value}</div>
                      </div>
                      <div className="ct-channel-arrow">→</div>
                      <div className="ct-channel-glow" style={{ background: c.gradient }} />
                    </a>
                  ))}
                </div>

                <div className="ct-time">
                  <div className="ct-time-glow" />
                  <div className="ct-time-icon">⏰</div>
                  <div>
                    <div className="ct-time-title">Thời gian hỗ trợ</div>
                    <div className="ct-time-desc">24/7 — Kể cả ngày lễ, Tết</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="ct-stats">
                <div className="ct-stat">
                  <div className="ct-stat-num">&lt; 24h</div>
                  <div className="ct-stat-label">Phản hồi</div>
                </div>
                <div className="ct-stat">
                  <div className="ct-stat-num">10K+</div>
                  <div className="ct-stat-label">Khách hàng</div>
                </div>
                <div className="ct-stat">
                  <div className="ct-stat-num">99%</div>
                  <div className="ct-stat-label">Hài lòng</div>
                </div>
              </div>
            </div>

            {/* RIGHT — FORM */}
            <form onSubmit={handleSubmit} className="ct-card ct-card-form">
              <div className="ct-card-head">
                <div className="ct-card-icon ct-icon-form">✉️</div>
                <div>
                  <h2>Gửi tin nhắn</h2>
                  <p>Điền thông tin — chúng tôi sẽ phản hồi sớm</p>
                </div>
              </div>

              {result && (
                <div className={`ct-alert ${result.success ? "ct-alert-ok" : "ct-alert-err"}`}>
                  <span className="ct-alert-icon">{result.success ? "✓" : "!"}</span>
                  <span>{result.message}</span>
                </div>
              )}

              <div className="ct-row">
                <div className={`ct-field ${focused === "name" ? "is-focused" : ""}`}>
                  <label>Tên <span className="ct-req">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className={`ct-field ${focused === "email" ? "is-focused" : ""}`}>
                  <label>Email <span className="ct-req">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="ct-row">
                <div className={`ct-field ${focused === "phone" ? "is-focused" : ""}`}>
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                    placeholder="0912345678"
                  />
                </div>
                <div className={`ct-field ${focused === "subject" ? "is-focused" : ""}`}>
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={() => setFocused("subject")}
                    onBlur={() => setFocused(null)}
                    placeholder="Vấn đề cần hỗ trợ"
                  />
                </div>
              </div>

              <div className={`ct-field ${focused === "message" ? "is-focused" : ""}`}>
                <label>Nội dung <span className="ct-req">*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  required
                  rows={5}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                />
              </div>

              <button type="submit" disabled={loading} className="ct-submit">
                <span className="ct-submit-glow" />
                {loading ? (
                  <>
                    <span className="ct-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi tin nhắn
                    <span className="ct-arrow">→</span>
                  </>
                )}
              </button>

              <p className="ct-privacy">
                �� Thông tin của bạn được bảo mật tuyệt đối
              </p>
            </form>
          </div>
        </div>

        <style jsx>{`
          .ct-page { position: relative; min-height: 100vh; padding: 100px 20px 60px; overflow: hidden; background: var(--bg-0);
            font-family: inherit;
          }

          /* Background orbs */
          .ct-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.4;
            pointer-events: none;
            z-index: 0;
          }
          .ct-orb-1 { width: 550px; height: 550px; background: #a78bfa; top: -180px; left: -180px; animation: ctFloat 14s ease-in-out infinite; }
          .ct-orb-2 { width: 450px; height: 450px; background: #ec4899; bottom: -150px; right: -150px; animation: ctFloat 18s ease-in-out infinite reverse; }
          .ct-orb-3 { width: 400px; height: 400px; background: #3b82f6; top: 45%; right: 15%; animation: ctFloat 22s ease-in-out infinite; }
          @keyframes ctFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(40px, -40px) scale(1.12); }
          }

          /* Grid pattern */
          .ct-grid-bg {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
            -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
            pointer-events: none;
            z-index: 0;
          }

          .ct-wrap {
            position: relative;
            z-index: 1;
            max-width: 1180px;
            margin: 0 auto;
          }

          /* HERO */
          .ct-hero { text-align: center; margin-bottom: 56px; }

          .ct-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            background: rgba(167, 139, 250, 0.1);
            border: 1px solid rgba(167, 139, 250, 0.25);
            border-radius: 999px;
            color: #c4b5fd;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 24px;
            backdrop-filter: blur(20px);
          }
          .ct-badge-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #34d399;
            box-shadow: 0 0 12px #34d399;
            animation: ctPulse 2s ease-in-out infinite;
          }
          @keyframes ctPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }

          .ct-h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 900; color: var(--text-0);
            margin-bottom: 18px;
            line-height: 1.1;
            letter-spacing: -0.03em;
          }
          .ct-gradient {
            background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f59e0b 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
            animation: ctGradient 4s ease infinite;
          }
          @keyframes ctGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .ct-sub { color: var(--text-2); font-size: 15px;
            font-size: 16px;
            max-width: 620px;
            margin: 0 auto;
            line-height: 1.65;
          }

          /* GRID */
          .ct-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            gap: 24px;
            align-items: start;
          }
          @media (max-width: 900px) { .ct-grid { grid-template-columns: 1fr; } }

          .ct-side { display: flex; flex-direction: column; gap: 20px; }

          /* CARD */
          .ct-card {
            position: relative;
            background: var(--bg-1);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 28px;
            backdrop-filter: blur(24px);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
            overflow: hidden;
          }
          .ct-card::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          }

          .ct-card-head {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          }
          .ct-card-icon {
            width: 50px; height: 50px;
            display: grid; place-items: center;
            background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(236, 72, 153, 0.2));
            border-radius: 14px;
            font-size: 22px;
            border: 1px solid rgba(167, 139, 250, 0.2);
          }
          .ct-icon-form {
            background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(59, 130, 246, 0.2));
            border-color: rgba(59, 130, 246, 0.2);
          }
          .ct-card-head h2 { font-size: 18px; font-weight: 800; color: var(--text-0); margin-bottom: 2px; }
          .ct-card-head p { font-size: 13px; color: var(--text-2); }

          /* CHANNELS */
          .ct-channels { display: flex; flex-direction: column; gap: 10px; }

          .ct-channel {
            position: relative;
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            background: var(--bg-2);
            border: 1px solid var(--border);
            border-radius: 16px;
            text-decoration: none;
            color: inherit;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            animation: ctSlideIn 0.5s ease both;
          }
          @keyframes ctSlideIn {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .ct-channel:hover {
            transform: translateX(6px);
            border-color: rgba(255,255,255,0.2);
            background: var(--bg-1);
          }
          .ct-channel-glow {
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            opacity: 0;
            filter: blur(40px);
            transition: all 0.5s;
            z-index: 0;
          }
          .ct-channel:hover .ct-channel-glow {
            left: 0;
            opacity: 0.15;
          }
          .ct-channel-icon {
            width: 44px; height: 44px;
            display: grid; place-items: center;
            border-radius: 12px;
            font-size: 20px;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          }
          .ct-channel-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
          .ct-channel-label { font-size: 12px; color: var(--text-2); margin-bottom: 2px; font-weight: 600; letter-spacing: 0.3px; }
          .ct-channel-value { font-size: 14px; font-weight: 700; color: var(--text-0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .ct-channel-arrow {
            font-size: 18px; color: var(--text-2);
            transition: all 0.3s;
            position: relative; z-index: 1;
          }
          .ct-channel:hover .ct-channel-arrow { transform: translateX(4px); color: var(--text-0); }

          /* TIME BOX */
          .ct-time {
            position: relative;
            display: flex;
            align-items: center;
            gap: 14px;
            margin-top: 20px;
            padding: 18px;
            background: linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(236, 72, 153, 0.05));
            border: 1px solid rgba(167, 139, 250, 0.2);
            border-radius: 16px;
            overflow: hidden;
          }
          .ct-time-glow {
            position: absolute;
            top: -50%; right: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(167,139,250,0.15), transparent 60%);
            animation: ctRotate 12s linear infinite;
          }
          @keyframes ctRotate { to { transform: rotate(360deg); } }
          .ct-time-icon { font-size: 26px; position: relative; z-index: 1; }
          .ct-time-title { font-size: 13px; font-weight: 700; color: #c4b5fd; margin-bottom: 3px; }
          .ct-time-desc { font-size: 13px; color: var(--text-1); }

          /* STATS */
          .ct-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .ct-stat {
            padding: 18px 12px;
            background: var(--bg-1);
            border: 1px solid var(--border);
            border-radius: 16px;
            text-align: center;
            transition: all 0.3s;
          }
          .ct-stat:hover {
            border-color: rgba(167,139,250,0.3);
            background: rgba(167, 139, 250, 0.05);
            transform: translateY(-3px);
          }
          .ct-stat-num {
            font-size: 20px;
            font-weight: 900;
            background: linear-gradient(135deg, #a78bfa, #ec4899);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
          }
          .ct-stat-label { font-size: 11px; color: var(--text-2); font-weight: 600; }

          /* FORM */
          .ct-card-form { padding: 32px; }

          .ct-alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 14px;
            margin-bottom: 22px;
            font-size: 14px;
            font-weight: 500;
            animation: ctShakeIn 0.4s;
          }
          @keyframes ctShakeIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .ct-alert-ok { background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; }
          .ct-alert-err { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; }
          .ct-alert-icon {
            width: 22px; height: 22px;
            display: grid; place-items: center;
            border-radius: 50%;
            font-size: 13px;
            font-weight: 900;
            background: currentColor;
            color: #0a0a0f;
          }

          .ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @media (max-width: 600px) { .ct-row { grid-template-columns: 1fr; } .ct-card-form { padding: 24px 20px; } .ct-card { padding: 24px 20px; } .ct-stats { grid-template-columns: 1fr; } }

          .ct-field { margin-bottom: 18px; position: relative; }
          .ct-field label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-1);
            margin-bottom: 8px;
            transition: color 0.25s;
          }
          .ct-field.is-focused label { color: #c4b5fd; }
          .ct-req { color: #f87171; }

          .ct-field input,
          .ct-field textarea {
            width: 100%;
            padding: 14px 16px;
            background: var(--bg-1);
            border: 1.5px solid var(--border);
            border-radius: 12px;
            color: var(--text-0);
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: all 0.25s ease;
          }
          .ct-field input::placeholder,
          .ct-field textarea::placeholder { color: rgba(156, 163, 175, 0.45); }

          .ct-field input:focus,
          .ct-field textarea:focus {
            border-color: #a78bfa;
            background: rgba(167, 139, 250, 0.06);
            box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.12), 0 8px 24px rgba(167, 139, 250, 0.15);
          }
          .ct-field textarea { resize: vertical; min-height: 130px; line-height: 1.55; }

          /* SUBMIT */
          .ct-submit {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px 24px;
            margin-top: 8px;
            background: linear-gradient(135deg, #a78bfa, #ec4899);
            background-size: 200% 200%;
            border: none;
            border-radius: 14px;
            color: var(--text-0);
            font-size: 15px;
            font-weight: 800;
            font-family: inherit;
            letter-spacing: 0.3px;
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 12px 32px rgba(167, 139, 250, 0.4);
            overflow: hidden;
          }
          .ct-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            background-position: 100% 50%;
            box-shadow: 0 18px 44px rgba(167, 139, 250, 0.55);
          }
          .ct-submit:active:not(:disabled) { transform: translateY(0); }
          .ct-submit:disabled { opacity: 0.75; cursor: not-allowed; }
          .ct-submit-glow {
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s;
          }
          .ct-submit:hover:not(:disabled) .ct-submit-glow { left: 100%; }
          .ct-arrow { transition: transform 0.3s; }
          .ct-submit:hover:not(:disabled) .ct-arrow { transform: translateX(4px); }

          .ct-spin {
            width: 16px; height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: var(--text-0);
            border-radius: 50%;
            animation: ctSpin 0.6s linear infinite;
          }
          @keyframes ctSpin { to { transform: rotate(360deg); } }

          .ct-privacy {
            margin-top: 16px;
            text-align: center;
            font-size: 12px;
            color: var(--text-2);
          }

          /* Responsive */
          @media (max-width: 900px) {
            .ct-page { padding: 100px 16px 60px; }
            .ct-hero { margin-bottom: 40px; }
          }
        `}</style>
      </main>
    </>
  );
}
