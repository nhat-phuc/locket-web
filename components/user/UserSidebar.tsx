"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/tai-khoan", label: "Tổng quan", icon: "📊" },
  { href: "/tai-khoan/vi", label: "Ví tiền", icon: "💳" },
  { href: "/tai-khoan/lich-su-nap-tien", label: "Lịch sử nạp tiền", icon: "📥" },
  { href: "/tai-khoan/voucher", label: "Voucher của tôi", icon: "🎟️" },
  { href: "/tai-khoan/lich-su-quay", label: "Lịch sử vòng quay", icon: "🎡" },
  { href: "/tai-khoan/lich-su-hoa-hong", label: "Lịch sử hoa hồng", icon: "💰" },
  { href: "/tai-khoan/ho-so", label: "Thông tin cá nhân", icon: "👤" },
  { href: "/tai-khoan/don-hang", label: "Lịch sử đơn hàng", icon: "📦" },
  { href: "/tai-khoan/giao-dich", label: "Lịch sử giao dịch", icon: "💰" },
  { href: "/tai-khoan/dich-vu", label: "Dịch vụ đã mua", icon: "🎁" },
  { href: "/tai-khoan/ma-giam-gia", label: "Mã giảm giá", icon: "��️" },
  { href: "/tai-khoan/cai-dat", label: "Cài đặt", icon: "⚙️" },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="user-sidebar">
      <nav className="user-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/tai-khoan" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`user-nav-item${isActive ? " active" : ""}`}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
