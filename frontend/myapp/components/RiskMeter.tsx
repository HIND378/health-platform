"use client";

interface RiskMeterProps {
  probability: number;
  riskLevel: "low" | "medium" | "high";
  label: string;
}

export default function RiskMeter({ probability, riskLevel, label }: RiskMeterProps) {
  const pct = Math.round(probability * 100);
  const color = riskLevel === "high" ? "var(--danger)"
    : riskLevel === "medium" ? "var(--warning)"
    : "var(--success)";

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="65" cy="65" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashoffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "65px 65px", transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace" }}>{pct}%</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>risque</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color }}>{riskLevel === "high" ? "Risque élevé" : riskLevel === "medium" ? "Risque modéré" : "Faible risque"}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}