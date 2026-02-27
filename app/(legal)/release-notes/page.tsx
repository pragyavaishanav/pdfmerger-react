import { releases } from "./releases";

export default function ReleaseNotesPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        Release Notes
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 40,
        }}
      >
        {releases.length} releases
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {releases.map((release, i) => (
          <div
            key={release.version}
            style={{
              padding: 24,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              transition: "border-color 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: i === 0 ? "var(--accent)" : "var(--text-primary)",
                  letterSpacing: 0.5,
                }}
              >
                v{release.version}
              </span>
              {i === 0 && (
                <span
                  style={{
                    padding: "2px 10px",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  Latest
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  letterSpacing: 0.5,
                  marginLeft: "auto",
                }}
              >
                {release.date}
              </span>
            </div>

            <ul
              style={{
                paddingLeft: 20,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                listStyleType: "disc",
              }}
            >
              {release.notes.map((note, idx) => (
                <li key={idx} style={{ fontSize: 13 }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
