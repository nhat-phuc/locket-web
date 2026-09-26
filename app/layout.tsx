
import type { Metadata, Viewport } from "next";
import { Inter, Sora, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Locket Gold | Dịch Vụ Nâng Cấp Locket VIP Giá Rẻ Số 1 Việt Nam",
  description: "Nâng cấp Locket Gold tự động chỉ trong 5s. Không cần iCloud, không cần mật khẩu.",
  keywords: ["locketgold", "locket gold", "nâng cấp locket gold", "locket vip", "locket premium"],
  authors: [{ name: "Locket Gold" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Locket Gold",
    title: "Locket Gold | Dịch Vụ Nâng Cấp Locket VIP",
    description: "Nâng cấp Locket Gold tự động chỉ trong 5s.",
    locale: "vi_VN",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/img/logo/icon.jpg", apple: "/img/logo/icon.jpg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#A78BFA",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} ${greatVibes.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
