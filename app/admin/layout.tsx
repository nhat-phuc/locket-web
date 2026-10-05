"use client";

import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-mode");
    document.documentElement.classList.add("admin-mode");
    return () => {
      document.body.classList.remove("admin-mode");
      document.documentElement.classList.remove("admin-mode");
    };
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
