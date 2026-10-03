import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./sub-pages.css";
import CatLoader from "@/components/CatLoader";
import FallingCanvas from "@/components/FallingCanvas";
import FXEffects from "@/components/FXEffects";
import AdminHideFX from "@/components/AdminHideFX";
import ClientShell, { ClientFooter } from "./ClientShell";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Locket Gold — Nâng Cấp Locket VIP Giá Rẻ Số 1 Việt Nam",
  description:
    "Nâng cấp Locket Gold tự động trong 5s. Không cần iCloud, không cần mật khẩu.",
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Locket Gold",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#a78bfa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className} suppressHydrationWarning>
        <CatLoader />
        <AdminHideFX>
          <FallingCanvas />
          <FXEffects />
        </AdminHideFX>

        {/* Header + Floating widgets */}
        <ClientShell />

        {/* Nội dung trang */}
        {children}

        {/* Footer + BottomNav — LUÔN SAU children */}
        <ClientFooter />
      </body>
    </html>
  );
}
