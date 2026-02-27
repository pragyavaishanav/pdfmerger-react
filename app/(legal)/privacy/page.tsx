export default function PrivacyPolicy() {
  const sectionHeading: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginTop: 32,
    marginBottom: 12,
    letterSpacing: 0.3,
  };

  const subHeading: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--text-primary)",
    marginTop: 20,
    marginBottom: 8,
  };

  const paragraph: React.CSSProperties = {
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: 12,
  };

  const list: React.CSSProperties = {
    paddingLeft: 24,
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    listStyleType: "disc",
  };

  return (
    <article>
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
        Privacy Policy
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 32,
        }}
      >
        Last updated: Feb 26, 2026
      </p>

      <div
        style={{
          height: 1,
          background: "var(--border)",
          marginBottom: 32,
        }}
      />

      <p style={paragraph}>
        Your privacy is extremely important to us. This policy explains what
        information our PDF Merger application collects, how it is used, and how
        we protect it.
      </p>

      <h2 style={sectionHeading}>1. Information We Collect</h2>

      <h3 style={subHeading}>
        1.1 Google Account Information (With User Consent)
      </h3>
      <p style={paragraph}>
        When you choose to sign in or open files using Google Drive&trade;, we
        may receive the following information from Google:
      </p>
      <ul style={list}>
        <li>Your email address</li>
        <li>Your name</li>
        <li>Your Google account profile picture</li>
      </ul>
      <p style={paragraph}>
        We access only the data that you explicitly grant permission for during
        the Google OAuth consent process.
      </p>

      <h3 style={subHeading}>
        1.2 Google Drive&trade; File Access (Temporary Only)
      </h3>
      <p style={paragraph}>
        When you select PDF files from Google Drive&trade; for merging, our
        server temporarily downloads those files to perform the merge operation.
        We access only basic file metadata such as:
      </p>
      <ul style={list}>
        <li>File name</li>
        <li>File ID</li>
        <li>File size</li>
        <li>File type / MIME type</li>
      </ul>
      <p style={paragraph}>
        We <strong style={{ color: "var(--accent)" }}>do NOT</strong> browse or
        access your entire Google Drive&trade; — only the specific file(s) you
        explicitly select for merging.
      </p>

      <h3 style={subHeading}>1.3 Application Usage Events</h3>
      <p style={paragraph}>
        We may log anonymized usage information, such as:
      </p>
      <ul style={list}>
        <li>Number of files merged per session</li>
        <li>Whether files were opened from Google Drive&trade; or uploaded locally</li>
        <li>General usage patterns to improve the service</li>
      </ul>

      <h2 style={sectionHeading}>2. Information We Do NOT Collect or Store</h2>
      <ul style={list}>
        <li>
          <strong>We do not permanently store your PDF files.</strong> Files are
          temporarily downloaded to our server solely for the merge operation.
          Once the merged PDF is delivered to you (or the server session ends),
          all file data is automatically deleted.
        </li>
        <li>
          <strong>We do not store file metadata.</strong> No record of your file
          names, contents, or structure is persisted after the session.
        </li>
        <li>
          Our server instances are ephemeral — they spin up to process your
          request and shut down afterward, meaning all data vanishes when the
          server closes.
        </li>
        <li>We do not sell or share any personal information with third parties.</li>
        <li>
          We do not access any Google Drive&trade; files except the ones you
          explicitly select.
        </li>
      </ul>

      <h2 style={sectionHeading}>3. How We Use Information</h2>
      <p style={paragraph}>We use the collected information to:</p>
      <ul style={list}>
        <li>Download your selected PDF files temporarily for merging</li>
        <li>Deliver the merged PDF back to you</li>
        <li>Improve application performance and user experience</li>
        <li>Diagnose and fix technical issues</li>
      </ul>
      <p style={paragraph}>
        We do <strong style={{ color: "var(--accent)" }}>not</strong> use your
        data for advertising or marketing.
      </p>

      <h2 style={sectionHeading}>4. Data Storage &amp; Security</h2>
      <ul style={list}>
        <li>
          PDF files are held in server memory only during the active merge
          session. No files are written to persistent storage.
        </li>
        <li>
          Server instances are stateless and ephemeral — all data is
          automatically destroyed when the session ends.
        </li>
        <li>All communication uses HTTPS encryption.</li>
        <li>
          We follow the Google API Services User Data Policy, including the
          Limited Use requirements.
        </li>
      </ul>

      <h2 style={sectionHeading}>5. Google API Services Compliance</h2>
      <p style={paragraph}>
        Our use of Google user data complies with the Google API Services User
        Data Policy, the OAuth 2.0 Limited Use Policy, and the Google
        Drive&trade; API terms. We access only the minimum data needed for the
        PDF Merger to function — specifically, the files you select for merging.
      </p>

      <h2 style={sectionHeading}>6. User Control &amp; Data Deletion</h2>
      <p style={paragraph}>You may:</p>
      <ul style={list}>
        <li>
          Revoke the application&apos;s access anytime through your Google
          Account settings at{" "}
          <a
            href="https://myaccount.google.com/permissions"
            style={{
              color: "var(--accent)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            myaccount.google.com/permissions
          </a>
        </li>
        <li>
          Since no file data or metadata is permanently stored, there is nothing
          to delete — your data is already gone once the session ends.
        </li>
        <li>
          Contact us to request deletion of any account-level information we may
          hold (e.g., email associated with sign-in).
        </li>
      </ul>

      <h2 style={sectionHeading}>7. Contact Us</h2>
      <p style={paragraph}>
        If you have any questions about this Privacy Policy, please contact us
        at{" "}
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
        .
      </p>
    </article>
  );
}
