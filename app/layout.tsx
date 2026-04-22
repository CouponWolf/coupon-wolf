import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* 🔥 MODERN FONT */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coupon Wolve",
  description: "Best coupons and deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      
      {/* ✅ MONETAG VERIFICATION */}
      <head>
        <meta name="monetag" content="2c316c201ef8888ddab6cf8ba3a40d49" />
      </head>

      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}