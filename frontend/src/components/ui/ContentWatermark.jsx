/**
 * ContentWatermark
 *
 * Renders a subtle repeating diagonal watermark over protected educational content.
 * Discourages unauthorized screenshots and sharing without obstructing reading.
 *
 * DISCLAIMER: This watermark is visible on screen but cannot prevent OS-level
 * screenshots. It serves as a deterrent and marks content as licensed.
 *
 * Props:
 *   email   — student's email address (shown in watermark)
 *   label   — optional override label (defaults to "Smart Bionote Reader")
 *   opacity — 0–1, default 0.045 (very subtle)
 *
 * Usage:
 *   <div style={{ position: "relative" }}>
 *     <ContentWatermark email={user.email} />
 *     {content}
 *   </div>
 */

const ContentWatermark = ({ email, label = "Smart Bionote Reader", opacity = 0.045 }) => {
  // Build the watermark text lines
  const line1 = label;
  const line2 = email ? `Licensed to: ${email}` : "Unauthorised reproduction prohibited";

  // Render a grid of watermark tiles using CSS repeat
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
      style={{ opacity }}
    >
      {/* Generate a grid of repeated watermark text tiles */}
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          transform: "rotate(-35deg)",
          gap: "0",
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "currentColor",
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
                lineHeight: 1.4,
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {line1}
            </span>
            <span
              style={{
                fontSize: "9px",
                color: "currentColor",
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
                marginTop: "2px",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {line2}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentWatermark;
