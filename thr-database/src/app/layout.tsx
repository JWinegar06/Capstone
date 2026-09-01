import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Treasure House Relics Database",
  description: "Historical mining archive database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
