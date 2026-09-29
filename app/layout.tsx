import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingWidgets from "@/components/FloatingWidgets";
import FallingCanvas from "@/components/FallingCanvas";
import FXEffects from "@/components/FXEffects";
import CatLoader from "@/components/CatLoader";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Locket Gold — Nâng Cấp Locket VIP Giá Rẻ Số 1 Việt Nam",
  description: "Nâng cấp Locket Gold tự động trong 5s. Không cần iCloud, không cần mật khẩu.",
  icons: { icon: "/img/logo/icon.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Hiệu ứng + loading */}
        <CatLoader />
        <FallingCanvas />
        <FXEffects />

        {/* Nội dung */}
        {children}

        {/* Nút nổi + Footer */}
        <FloatingWidgets />
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
