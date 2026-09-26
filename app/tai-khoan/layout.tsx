"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserSidebar from "@/components/user/UserSidebar";

export default function TaiKhoanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("locket_user");
    if (!stored) {
      router.push("/dang-nhap");
      return;
    }
    try {
      setUser(JSON.parse(stored));
      setChecked(true);
    } catch {
      router.push("/dang-nhap");
    }
  }, [router]);

  if (!checked) return null;

  return (
    <>
      <Header />
      <main className="wrap" style={{ minHeight: "80vh", paddingTop: 32, paddingBottom: 60 }}>
        <div className="user-layout">
          <UserSidebar />
          <div className="user-content">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
