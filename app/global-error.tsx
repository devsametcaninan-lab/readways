"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          background: "#0c0d12",
          color: "#e4e4e7"
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>ReadWays hit a problem</h1>
          <p style={{ marginTop: "12px", fontSize: "0.875rem", lineHeight: 1.6, color: "#a1a1aa" }}>
            Something unexpected happened. Please try again.
          </p>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e4e4e7",
                textDecoration: "none",
                fontWeight: 500
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
