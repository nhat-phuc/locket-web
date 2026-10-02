"use client";

import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-mode");

    const hideElements = () => {
      const selectors = [
        "body > nav",
        "body > footer",
        "body > .nav",
        ".nav",
        ".mobile-sidebar",
        ".mobile-sidebar-overlay",
        "[class*='bottom-nav']",
        "[class*='BottomNav']",
        ".sales-popup",
        ".np-wrapper",
        ".floating-widgets",
        ".cat-loader",
        ".falling-canvas",
        ".fx-effects",
        ".bg-3d-glow",
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      });
    };

    hideElements();
    const observer = new MutationObserver(hideElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.classList.remove("admin-mode");
      observer.disconnect();
      const selectors = [
        "body > nav",
        "body > footer",
        ".nav",
        ".mobile-sidebar",
        ".sales-popup",
        ".np-wrapper",
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.display = "";
        });
      });
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
          background: var(--bg-0) !important;
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

        /* Chống tràn ngang */
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
