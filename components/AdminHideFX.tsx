"use client";

import { usePathname } from "next/navigation";

export default function AdminHideFX({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
