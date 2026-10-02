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
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
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
      {/* Nút menu mobile - BÊN PHẢI */}
      {isMobile && (
        <button
          className="admin-mobile-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            left: "auto",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#1a1230",
            border: "1px solid rgba(167, 139, 250, 0.3)",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      )}

      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 99998,
          }}
        />
      )}

      <aside
        className="admin-sidebar"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          width: isMobile ? "82vw" : 280,
          maxWidth: isMobile ? 340 : 280,
          background: "#0f0a1e",
          borderLeft: isMobile ? "1px solid rgba(167,139,250,0.2)" : "none",
          borderRight: !isMobile ? "1px solid rgba(167,139,250,0.15)" : "none",
          display: "flex",
          flexDirection: "column",
          zIndex: 99999,
          overflowY: "auto",
          // Desktop: bên trái | Mobile: bên phải
          left: isMobile ? "auto" : 0,
          right: isMobile ? 0 : "auto",
          transform: isMobile ? (open ? "translateX(0)" : "translateX(105%)") : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
          boxShadow: isMobile && open ? "-4px 0 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px", borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            {isMobile ? "Menu" : "Admin Panel"}
          </span>
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              style={{ width: 34, height: 34, borderRadius: 10, background: "transparent", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* USER CARD */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, margin: 12, background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(124,58,237,0.08))", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={displayName}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7c3aed&color=fff&size=100&bold=true`; }}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid #a78bfa", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: "#a78bfa", fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>
                Đang đăng nhập
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ display: "inline-block", padding: "2px 8px", background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderRadius: 999, fontSize: 10.5, fontWeight: 800 }}>
                👑 ADMIN
              </div>
            </div>
          </div>
        )}

        {/* NAV */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px 16px" }}>
          {menuGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, padding: "0 12px 8px", opacity: 0.7 }}>
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 14px",
                      borderRadius: 10,
                      color: isActive ? "#fff" : "#c7c5db",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 2,
                      background: isActive ? "linear-gradient(135deg, rgba(167,139,250,0.22), rgba(124,58,237,0.15))" : "transparent",
                      border: isActive ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: 17, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div style={{ padding: 12, borderTop: "1px solid rgba(167,139,250,0.15)" }}>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#c7c5db", textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 2 }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>🏠</span>
            <span>Về trang chủ</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#f87171", background: "transparent", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
