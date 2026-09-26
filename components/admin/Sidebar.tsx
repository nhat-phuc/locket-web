"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuGroups = [
  {
    title: "Tổng quan",
    items: [
      { href: "/admin", label: "Dashboard", icon: "📊" },
    ],
  },
  {
    title: "Kinh doanh",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
      { href: "/admin/transactions", label: "Giao dịch", icon: "💰" },
      { href: "/admin/coupons", label: "Mã giảm giá", icon: "🏷️" },
      { href: "/admin/packages", label: "Gói dịch vụ", icon: "🎁" },
      { href: "/admin/services", label: "Dịch vụ", icon: "⚙️" },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { href: "/admin/users", label: "Người dùng", icon: "👥" },
      { href: "/admin/reviews", label: "Đánh giá", icon: "⭐" },
      { href: "/admin/notifications", label: "Thông báo", icon: "🔔" },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { href: "/admin/posts", label: "Bài viết", icon: "📝" },
      { href: "/admin/banners", label: "Banner", icon: "🖼️" },
      { href: "/admin/lucky-wheel", label: "Vòng quay", icon: "🎡" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/logs", label: "Logs", icon: "📋" },
      { href: "/admin/settings", label: "Cài đặt", icon: "🔧" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <button
          className="admin-mobile-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      )}

      {/* Overlay */}
      {isMobile && open && (
        <div className="admin-overlay" onClick={() => setOpen(false)} />
      )}

      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo/icon.jpg" alt="Locket Gold" />
            <div>
              <div className="admin-logo-title">Admin Panel</div>
              <div className="admin-logo-sub">Locket Gold</div>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          {menuGroups.map((group) => (
            <div key={group.title} className="admin-nav-group">
              <div className="admin-nav-group-title">{group.title}</div>
              {group.items.map((item, idx) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-item${isActive ? " active" : ""}`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <span className="admin-nav-icon">{item.icon}</span>
                    <span className="admin-nav-label">{item.label}</span>
                    {isActive && <span className="admin-nav-dot" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item">
            <span className="admin-nav-icon">🏠</span>
            <span className="admin-nav-label">Về trang chủ</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
