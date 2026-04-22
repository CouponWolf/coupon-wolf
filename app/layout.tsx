import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // ✅ IMPORTANT
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

      <head>
        {/* ✅ MONETAG VERIFICATION */}
        <meta name="monetag" content="2c316c201ef8888ddab6cf8ba3a40d49" />
      </head>

      <body className={`${inter.className} min-h-full flex flex-col`}>
        
        {/* ✅ MONETAG IN-PAGE PUSH (SAFE AD FORMAT) */}
        <Script
          id="monetag-inpage"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='10912788',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`,
          }}
        />

        {children}
      </body>
    </html>
  );
}