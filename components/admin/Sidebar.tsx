"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const menuGroups = [
  { title: "Tổng quan", items: [{ href: "/admin", label: "Dashboard", icon: "📊" }] },
  {
    title: "Kinh doanh",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
      { href: "/admin/pending-transactions", label: "GD chờ duyệt", icon: "⏳" },
      { href: "/admin/withdrawals", label: "Rút tiền", icon: "💸" },
      { href: "/admin/refunds", label: "Hoàn tiền", icon: "↩️" },
      { href: "/admin/transactions", label: "Giao dịch", icon: "💰" },
      { href: "/admin/revenue", label: "Doanh thu", icon: "📈" },
      { href: "/admin/coupons", label: "Mã giảm giá", icon: "🏷️" },
      { href: "/admin/packages", label: "Gói dịch vụ", icon: "🎁" },
      { href: "/admin/services", label: "Dịch vụ", icon: "⚙️" },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { href: "/admin/users", label: "Người dùng", icon: "👥" },
      { href: "/admin/balance", label: "Điều chỉnh số dư", icon: "💳" },
      { href: "/admin/referral", label: "Mã giới thiệu", icon: "🔗" },
      { href: "/admin/reviews", label: "Đánh giá", icon: "⭐" },
      { href: "/admin/notifications", label: "Thông báo", icon: "🔔" },
    ],
  },
  { title: "Locket", items: [{ href: "/admin/lockets", label: "Quản lý Locket", icon: "🎀" }] },
  {
    title: "Nội dung",
    items: [
      { href: "/admin/posts", label: "Bài viết", icon: "📝" },
      { href: "/admin/banners", label: "Banner", icon: "🖼️" },
      { href: "/admin/lucky-wheel", label: "Vòng quay", icon: "🎡" },
      { href: "/admin/marketing", label: "Email marketing", icon: "📧" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/reports", label: "Báo cáo vi phạm", icon: "🚨" },
      { href: "/admin/activity", label: "Hoạt động", icon: "📋" },
      { href: "/admin/logs", label: "Logs", icon: "📊" },
      { href: "/admin/settings", label: "Cài đặt", icon: "🔧" },
      { href: "/admin/logo-icon", label: "Logo & Icon", icon: "🎨" },
    ],
  },
];

interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  picture: string | null;
  role: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (isMobile && open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, open]);

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
    sessionStorage.removeItem("locket_user");
    localStorage.removeItem("locket_user");
    router.push("/dang-nhap");
    router.refresh();
  };

  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "Admin";
  const avatar = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7c3aed&color=fff&size=100&bold=true`;

  return (
    <>
      {isMobile && (
        <button
          className="admin-mobile-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      )}

      <div
        className={`admin-overlay ${isMobile && open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: 20, fontWeight: 900, color: "var(--text-0)" }}>
            {isMobile ? "Menu" : "Admin Panel"}
          </span>
        </div>

        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 14,
              margin: 12,
              background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(124,58,237,0.06))",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 14,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={displayName}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7c3aed&color=fff&size=100&bold=true`;
              }}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                objectFit: "cover", border: "2px solid #a78bfa", flexShrink: 0,
              }}
            />
            <div className="admin-user-card-info" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: "#a78bfa", fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>
                Đang đăng nhập
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-0)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ display: "inline-block", padding: "2px 8px", background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderRadius: 999, fontSize: 10.5, fontWeight: 800 }}>
                👑 ADMIN
              </div>
            </div>
          </div>
        )}

        <nav className="admin-nav">
          {menuGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 1, padding: "0 12px 8px", opacity: 0.7 }}>
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`admin-nav-item ${isActive ? "active" : ""}`}
                  >
                    <span style={{ fontSize: 17, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" onClick={() => setOpen(false)} className="admin-nav-item">
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>🏠</span>
            <span>Về trang chủ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
