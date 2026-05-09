"use client";
import { ReactNode } from "react";

export default function EmptyState({ icon, message, action }: {
  icon: ReactNode; message: string; action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 12, display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: action ? 16 : 0 }}>{message}</p>
      {action}
    </div>
  );
}