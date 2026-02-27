import Link from "next/link";

export default function SupportPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingTop: 32,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "var(--radius-lg)",
          background: "var(--accent-soft)",
          border: "1.5px solid var(--border-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          color: "var(--accent)",
        }}
      >
        <svg
          width="36"
          height="36"
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
            fillOpacity="0.15"
          />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        Support &amp; Feedback
      </h1>

      <p
        style={{
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: 36,
        }}
      >
        Need help merging your PDFs? Found a bug or have a feature idea?
        We&apos;d love to hear from you. Your feedback helps us improve the PDF
        Merger for everyone.
      </p>

      <Link
        href="https://docs.google.com/forms/d/e/1FAIpQLSdkR44wgU7oUhfMnT8lthbU_wZYK9TLYxXO1l-ti5NGZL580A/viewform?usp=header"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 32px",
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: 1,
          textTransform: "uppercase",
          textDecoration: "none",
          cursor: "pointer",
          boxShadow: "var(--shadow-accent)",
          transition: "all 0.3s ease",
        }}
      >
        Share Feedback or Report a Bug
        <span style={{ fontSize: 16 }}>&#8599;</span>
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          height: 1,
          background: "var(--border)",
          margin: "48px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        <p>
          For urgent technical issues, reach us directly at{" "}
          <a
            href="mailto:rahul@dopeoffice.ai"
            style={{
              color: "var(--accent)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            rahul@dopeoffice.ai
          </a>
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          We usually respond within 24-48 hours
        </p>
      </div>
    </div>
  );
}
