"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// ═══ ICONS SVG ═══
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  key: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  withdraw: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  refund: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  money: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  tag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  gift: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  locket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  post: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  image: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  wheel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  file: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  palette: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  balance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 12h.01M2 10h20"/></svg>,
};

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

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
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [badges, setBadges] = useState({ pendingOrders: 0, withdrawals: 0, reviews: 0 });

  // Load collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  // Mobile check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Load user
  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Load badges
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stats) {
          setBadges({
            pendingOrders: d.stats.pendingOrders || 0,
            withdrawals: 0,
            reviews: 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Mobile overflow lock
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
  const avatar = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=100&bold=true`;

  // ═══ MENU GROUPS ═══
  const menuGroups: MenuGroup[] = [
    {
      title: "Tổng quan",
      items: [
        { href: "/admin", label: "Tổng quan", icon: Icons.dashboard },
        { href: "/admin/users", label: "Quản lý người dùng", icon: Icons.users },
        { href: "/admin/user-info", label: "Mật khẩu & Đăng ký", icon: Icons.key },
      ],
    },
    {
      title: "Kinh doanh",
      items: [
        { href: "/admin/orders", label: "Đơn hàng", icon: Icons.orders, badge: badges.pendingOrders },
        { href: "/admin/pending-transactions", label: "GD chờ duyệt", icon: Icons.clock },
        { href: "/admin/withdrawals", label: "Rút tiền", icon: Icons.withdraw, badge: badges.withdrawals },
        { href: "/admin/refunds", label: "Hoàn tiền", icon: Icons.refund },
        { href: "/admin/transactions", label: "Giao dịch", icon: Icons.money },
        { href: "/admin/revenue", label: "Doanh thu", icon: Icons.chart },
        { href: "/admin/coupons", label: "Mã giảm giá", icon: Icons.tag },
        { href: "/admin/packages", label: "Gói dịch vụ", icon: Icons.gift },
        { href: "/admin/services", label: "Dịch vụ", icon: Icons.settings },
      ],
    },
    {
      title: "Người dùng",
      items: [
        { href: "/admin/balance", label: "Điều chỉnh số dư", icon: Icons.balance },
        { href: "/admin/referral", label: "Mã giới thiệu", icon: Icons.link },
        { href: "/admin/reviews", label: "Đánh giá", icon: Icons.star, badge: badges.reviews },
        { href: "/admin/notifications", label: "Thông báo", icon: Icons.bell },
      ],
    },
    {
      title: "Locket",
      items: [{ href: "/admin/lockets", label: "Quản lý Locket", icon: Icons.locket }],
    },
    {
      title: "Nội dung",
      items: [
        { href: "/admin/posts", label: "Bài viết", icon: Icons.post },
        { href: "/admin/banners", label: "Banner", icon: Icons.image },
        { href: "/admin/lucky-wheel", label: "Vòng quay", icon: Icons.wheel },
        { href: "/admin/marketing", label: "Email marketing", icon: Icons.mail },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { href: "/admin/reports", label: "Báo cáo vi phạm", icon: Icons.alert },
        { href: "/admin/activity", label: "Hoạt động", icon: Icons.activity },
        { href: "/admin/logs", label: "Logs", icon: Icons.file },
        { href: "/admin/settings", label: "Cài đặt", icon: Icons.settings },
        { href: "/admin/logo-icon", label: "Logo & Icon", icon: Icons.palette },
      ],
    },
  ];

  // Filter theo search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return menuGroups;
    const q = search.toLowerCase();
    return menuGroups.map((g) => ({
      ...g,
      items: g.items.filter((it) => it.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [search]);

  return (
    <>
      <style jsx global>{`
        /* ═══ MOBILE TOGGLE ═══ */
        .admin-mobile-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 200;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,.08);
          font-family: inherit;
        }
        @media (max-width: 768px) { .admin-mobile-toggle { display: grid; place-items: center; } }

        /* ═══ OVERLAY ═══ */
        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.4);
          z-index: 99;
          opacity: 0;
          transition: opacity .25s;
        }
        .admin-overlay.show { opacity: 1; }
        @media (max-width: 768px) { .admin-overlay.show { display: block; } }

        /* ═══ SIDEBAR ═══ */
        .admin-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: #fff;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          transition: width .25s cubic-bezier(.4,0,.2,1), transform .25s;
          z-index: 100;
          order: 2;
          box-shadow: -4px 0 24px rgba(0,0,0,.02);
        }
        .admin-sidebar::-webkit-scrollbar { width: 6px; }
        .admin-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
        .admin-sidebar::-webkit-scrollbar-track { background: transparent; }

        .admin-sidebar.collapsed { width: 72px; }
        .admin-sidebar.collapsed .sb-label,
        .admin-sidebar.collapsed .sb-title,
        .admin-sidebar.collapsed .sb-search-wrap,
        .admin-sidebar.collapsed .sb-user-info,
        .admin-sidebar.collapsed .sb-footer-text { display: none; }
        .admin-sidebar.collapsed .sb-item { justify-content: center; padding: 12px; }
        .admin-sidebar.collapsed .sb-badge { position: absolute; top: 6px; right: 6px; padding: 2px 5px; font-size: 9px; }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            width: 280px;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-sidebar.collapsed { width: 280px; }
          .admin-sidebar.collapsed .sb-label,
          .admin-sidebar.collapsed .sb-title,
          .admin-sidebar.collapsed .sb-search-wrap,
          .admin-sidebar.collapsed .sb-user-info,
          .admin-sidebar.collapsed .sb-footer-text { display: block; }
        }

        /* ═══ HEADER ═══ */
        .sb-header {
          padding: 18px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-shrink: 0;
        }
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .sb-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 900;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(37,99,235,.3);
        }
        .sb-logo-text {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -.02em;
        }
        .sb-logo-sub {
          font-size: 10.5px;
          color: #64748b;
          font-weight: 600;
        }
        .sb-collapse-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f1f5f9;
          border: none;
          color: #475569;
          cursor: pointer;
          display: grid;
          place-items: center;
          font-size: 14px;
          transition: all .15s;
          flex-shrink: 0;
        }
        .sb-collapse-btn:hover { background: #e2e8f0; color: #0f172a; }
        @media (max-width: 768px) { .sb-collapse-btn { display: none; } }

        /* ═══ USER CARD ═══ */
        .sb-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin: 12px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .sb-user img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #3b82f6;
          flex-shrink: 0;
        }
        .sb-user-name {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sb-user-role {
          display: inline-block;
          padding: 2px 8px;
          background: #fbbf24;
          color: #78350f;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 900;
          letter-spacing: .3px;
        }
        .admin-sidebar.collapsed .sb-user { padding: 8px; justify-content: center; }
        .admin-sidebar.collapsed .sb-user img { width: 36px; height: 36px; }

        /* ═══ SEARCH ═══ */
        .sb-search-wrap {
          padding: 8px 12px;
          flex-shrink: 0;
        }
        .sb-search {
          width: 100%;
          padding: 9px 12px 9px 34px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          outline: none;
          transition: all .15s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 11px center;
        }
        .sb-search:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.1);
        }

        /* ═══ NAV ═══ */
        .sb-nav {
          flex: 1;
          padding: 8px 10px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .sb-group { margin-bottom: 14px; }
        .sb-title {
          font-size: 10.5px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .8px;
          padding: 0 10px 6px;
        }
        .sb-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 9px;
          color: #475569;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          transition: all .15s;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .sb-item:hover { background: #f1f5f9; color: #0f172a; }
        .sb-item.active {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #2563eb;
          font-weight: 800;
          box-shadow: 0 1px 2px rgba(37,99,235,.1);
        }
        .sb-item.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: #2563eb;
          border-radius: 0 3px 3px 0;
        }
        .sb-icon {
          display: grid;
          place-items: center;
          width: 20px;
          flex-shrink: 0;
        }
        .sb-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .sb-badge {
          padding: 2px 7px;
          background: #ef4444;
          color: #fff;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          flex-shrink: 0;
          letter-spacing: .2px;
          box-shadow: 0 2px 6px rgba(239,68,68,.3);
        }

        /* ═══ FOOTER ═══ */
        .sb-footer {
          padding: 10px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
        }
        .sb-footer-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 13.5px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          text-decoration: none;
          transition: all .15s;
          width: 100%;
          text-align: left;
          white-space: nowrap;
        }
        .sb-footer-btn:hover { background: #f1f5f9; color: #0f172a; }
        .sb-footer-btn.danger { color: #dc2626; }
        .sb-footer-btn.danger:hover { background: #fef2f2; }
        .admin-sidebar.collapsed .sb-footer-btn { justify-content: center; }
      `}</style>

      {/* MOBILE TOGGLE */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setOpen((s) => !s)}
        aria-label="Menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* OVERLAY */}
      <div
        className={`admin-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
        {/* HEADER */}
        <div className="sb-header">
          <div className="sb-logo">
            <div className="sb-logo-icon">L</div>
            {!collapsed && (
              <div>
                <div className="sb-logo-text">Locket Gold</div>
                <div className="sb-logo-sub">Admin Panel</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              className="sb-collapse-btn"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Mở rộng" : "Thu gọn"}
            >
              {collapsed ? "→" : "←"}
            </button>
          )}
        </div>

        {/* USER CARD */}
        {user && (
          <div className="sb-user">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={displayName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=100&bold=true`;
              }}
            />
            {!collapsed && (
              <div className="sb-user-info" style={{ minWidth: 0 }}>
                <div className="sb-user-name">{displayName}</div>
                <div style={{ marginTop: 2 }}>
                  <span className="sb-user-role">👑 ADMIN</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEARCH */}
        {!collapsed && (
          <div className="sb-search-wrap">
            <input
              className="sb-search"
              type="text"
              placeholder="Tìm menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* NAV */}
        <nav className="sb-nav">
          {filteredGroups.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 12.5 }}>
              Không tìm thấy menu
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.title} className="sb-group">
                {!collapsed && <div className="sb-title">{group.title}</div>}
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`sb-item ${isActive ? "active" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="sb-icon">{item.icon}</span>
                      {!collapsed && <span className="sb-label">{item.label}</span>}
                      {item.badge && item.badge > 0 ? (
                        <span className="sb-badge">{item.badge > 99 ? "99+" : item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </nav>

        {/* FOOTER */}
        <div className="sb-footer">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="sb-footer-btn"
            title={collapsed ? "Về trang chủ" : undefined}
          >
            <span className="sb-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            {!collapsed && <span className="sb-footer-text">Về trang chủ</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="sb-footer-btn danger"
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <span className="sb-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {!collapsed && <span className="sb-footer-text">Đăng xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
