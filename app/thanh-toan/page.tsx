"use client";

import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThanhToanContent from "./ThanhToanContent";

export default function ThanhToanPage() {
  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ minHeight: "80vh" }}>
        <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>}>
          <ThanhToanContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
