"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingWidgets from "@/components/FloatingWidgets";

export default function ClientShell() {
  const pathname = usePathname();

  // Ẩn hết menu user khi vào /admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Header />
      <FloatingWidgets />
    </>
  );
}

export function ClientFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Footer />
      <BottomNav />
    </>
  );
}
