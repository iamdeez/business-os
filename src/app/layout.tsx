import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Business OS",
  description: "B2B 에이전시의 문의, 고객사, 파일 전달을 연결하는 운영 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
