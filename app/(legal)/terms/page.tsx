export default function TermsOfService() {
  const sectionHeading: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginTop: 32,
    marginBottom: 12,
    letterSpacing: 0.3,
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
        Terms of Service
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
        By using our PDF Merger application, you agree to the following terms and
        conditions. Please read carefully before using the service.
      </p>

      <h2 style={sectionHeading}>1. Use of Service</h2>
      <p style={paragraph}>
        Our PDF Merger is designed to help you combine multiple PDF documents
        into a single file. You may select files from Google Drive&trade; or
        upload them directly. The merged PDF is delivered back to you for
        download.
      </p>
      <p style={paragraph}>
        You agree to use this service only for lawful purposes and in accordance
        with these terms.
      </p>

      <h2 style={sectionHeading}>2. File Processing</h2>
      <p style={paragraph}>
        When you use our service, your PDF files are temporarily downloaded to
        our server to perform the merge operation. Important details:
      </p>
      <ul style={list}>
        <li>
          Files are held in server memory only for the duration of the merge
          process.
        </li>
        <li>
          Our servers are ephemeral — they spin up for your session and shut down
          afterward. All file data is automatically destroyed.
        </li>
        <li>
          No copies of your files or their contents are retained after the
          session.
        </li>
        <li>
          We do not inspect, analyze, or modify the content of your files beyond
          what is necessary to merge them.
        </li>
      </ul>

      <h2 style={sectionHeading}>3. Google Drive&trade; Integration</h2>
      <p style={paragraph}>
        Our application integrates with Google Drive&trade; to allow you to
        select files for merging. By using this feature, you authorize us to:
      </p>
      <ul style={list}>
        <li>
          Access only the specific files you select via the Google Drive&trade;
          Picker.
        </li>
        <li>
          Download those files temporarily for the purpose of merging.
        </li>
      </ul>
      <p style={paragraph}>
        We do not access, browse, or modify any other files in your Google
        Drive&trade;.
      </p>

      <h2 style={sectionHeading}>4. Intellectual Property</h2>
      <p style={paragraph}>
        The PDF Merger application, including its branding, logo, design, and
        code, is owned by us. Your uploaded or selected files remain your
        property at all times. We claim no ownership over any content you
        process through our service.
      </p>

      <h2 style={sectionHeading}>5. Limitation of Liability</h2>
      <p style={paragraph}>
        We provide this service &ldquo;as-is&rdquo; without warranties of any
        kind, express or implied. We are not responsible for:
      </p>
      <ul style={list}>
        <li>Data loss during the merge process</li>
        <li>Compatibility issues with specific PDF files</li>
        <li>
          Service interruptions or downtime
        </li>
        <li>
          Any damages arising from the use or inability to use the service
        </li>
      </ul>

      <h2 style={sectionHeading}>6. Prohibited Uses</h2>
      <p style={paragraph}>You agree not to:</p>
      <ul style={list}>
        <li>Use the service to process illegal or harmful content</li>
        <li>Attempt to overload or disrupt the service</li>
        <li>Reverse-engineer or attempt to extract the source code</li>
        <li>Use automated tools to abuse the service</li>
      </ul>

      <h2 style={sectionHeading}>7. Changes to Terms</h2>
      <p style={paragraph}>
        These terms may be updated periodically. Continued use of the service
        after changes indicates acceptance of the revised terms. We will update
        the &ldquo;Last updated&rdquo; date at the top of this page when changes
        are made.
      </p>

      <h2 style={sectionHeading}>8. Contact</h2>
      <p style={paragraph}>
        If you have questions about these Terms of Service, please contact us at{" "}
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
