"use client";

import { SessionProvider } from "next-auth/react";
import Script from "next/script";

export default function MicrosoftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <SessionProvider>

      <Script src="https://js.live.net/v7.2/OneDrive.js" strategy="beforeInteractive" />
      {children}
    </SessionProvider>
    </>
  );
}