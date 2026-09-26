import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo/logo.jpg" alt="Locket Gold" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain" }} />
          <div>
            <div className="brand-main">Locket Gold</div>
            <div className="brand-sub">Phúc Nexus</div>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/">Trang chủ</Link>
          <Link href="/kich-hoat">Kích hoạt</Link>
          <Link href="/huong-dan">Hướng dẫn</Link>
          <Link href="/bang-gia">Bảng giá</Link>
          <Link href="/bai-viet">Bài viết</Link>
          <Link href="/lien-he">Liên hệ</Link>
        </div>

        <div className="footer-social">
          <a href="http://zalo.me/84344421026" target="_blank" rel="noopener noreferrer">💬 Zalo</a>
          <a href="https://t.me/hethonglocket" target="_blank" rel="noopener noreferrer">📢 Telegram</a>
        </div>

        <div className="footer-copy">
          © 2026 <strong>Locket Gold</strong> — locketgold.app. Phát triển bởi{" "}
          <a href="https://zalo.me/0344421026" target="_blank" rel="noopener noreferrer">Phúc Nexus</a>
        </div>
      </div>
    </footer>
  );
}
