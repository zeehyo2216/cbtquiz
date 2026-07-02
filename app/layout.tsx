import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "스마트 CBT 기출문제 풀이",
  description: "모바일에 최적화된 슬라이딩 방식 CBT 기출문제 풀이 사이트입니다.",
  keywords: "CBT, 기출문제, 자격증, 모의고사, 랜덤 문제풀이, 오답노트",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-[#e2e8f0] selection:bg-indigo-500 selection:text-white font-sans">
        <main className="flex-1 flex flex-col max-w-md mx-auto w-full border-x border-[#1e293b]/60 bg-[#0f172a] relative shadow-[0_0_50px_rgba(0,0,0,0.8)] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
