"use client";

/**
 * Root-level error boundary. Catches errors that escape the root layout.
 * Must define its own <html> and <body>; no internal error details exposed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1.5rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>
            Something went wrong
          </h2>
          <p
            style={{
              maxWidth: "28rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#64748b",
              marginTop: "0.5rem",
            }}
          >
            We couldn’t load this page. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              background: "#1e293b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
