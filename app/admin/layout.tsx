"use client";

import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => {
      document.body.classList.remove("admin-mode");
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        body.admin-mode {
          overflow-x: hidden !important;
        }

        .admin-layout {
          display: flex !important;
          min-height: 100vh !important;
        }

        .admin-main {
          flex: 1 !important;
          margin-left: 280px !important;
          padding: 32px !important;
          min-height: 100vh !important;
          box-sizing: border-box !important;
          transition: margin 0.3s !important;
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 0 !important;
            padding: 76px 16px 32px !important;
          }
        }

        .admin-layout * {
          box-sizing: border-box;
        }
      `}</style>

      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
