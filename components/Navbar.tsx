"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Trang chủ", icon: "🏠" },
  { href: "/kich-hoat", label: "Kích hoạt", icon: "⚡" },
  { href: "/huong-dan", label: "Hướng dẫn", icon: "📖" },
  { href: "/bang-gia", label: "Bảng giá", icon: "💎" },
  { href: "/tai-khoan", label: "Tài khoản", icon: "👤" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive ? " active" : ""}`}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}