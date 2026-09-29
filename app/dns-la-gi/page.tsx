"use client";

import Header from "@/components/Header";


export default function Page() {
  return (
    <>
      <Header />
      <main className="wrap center-y" style={{ paddingTop: 60, paddingBottom: 60, minHeight: "70vh" }}>
        <div className="page-shell" style={{ maxWidth: 800 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 24 }}>
            DNS là gì?
          </h1>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-1)" }}>
            <p>Nội dung đang được cập nhật...</p>
            <p>Vui lòng quay lại sau hoặc liên hệ qua Zalo: <a href="https://zalo.me/0344421026" target="_blank" style={{ color: "var(--accent-bright)", fontWeight: 700 }}>0344421026</a></p>
          </div>
        </div>
      </main>
      
    </>
  );
}
