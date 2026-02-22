import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DopeOffice — PDF & Document Studio",
  description: "Merge and manage PDF documents with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 28 28' fill='none'%3E%3Crect x='2' y='4' width='14' height='18' rx='2' stroke='%23FF6B35' stroke-width='1.5'/%3E%3Crect x='10' y='6' width='14' height='18' rx='2' stroke='%23FF6B35' stroke-width='1.5' fill='%23FF6B35' fill-opacity='0.15'/%3E%3C/svg%3E"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
