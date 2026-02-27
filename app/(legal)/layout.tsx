"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
  { href: "/release-notes", label: "Releases" },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        overflow: "auto",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 64,
          background: "var(--header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 768,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 28 28"
              fill="none"
              style={{ color: "var(--accent)" }}
            >
              <rect
                x="2"
                y="4"
                width="14"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="10"
                y="6"
                width="14"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                letterSpacing: 3,
                textTransform: "uppercase" as const,
                color: "var(--text-primary)",
              }}
            >
              PDF MERGER
            </span>
          </Link>

          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: 1,
                    textTransform: "uppercase" as const,
                    textDecoration: "none",
                    fontFamily: "var(--font-mono)",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-soft)" : "transparent",
                    border: `1px solid ${isActive ? "var(--border-accent)" : "transparent"}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 768,
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {children}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 32px",
          textAlign: "center",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: 1,
          color: "var(--text-muted)",
          textTransform: "uppercase" as const,
        }}
      >
        DopeOffice &middot; PDF Merger &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
