"use client";

const statusConfig: Record<string, { label: string; cls: string }> = {
  "en_attente": { label: "En attente", cls: "badge-yellow" },
  "accepté": { label: "Accepté", cls: "badge-green" },
  "refusé": { label: "Refusé", cls: "badge-red" },
  "annulé": { label: "Annulé", cls: "badge-gray" },
  "normal": { label: "Normal", cls: "badge-green" },
  "anormal": { label: "Anormal", cls: "badge-red" },
  "pending": { label: "En attente", cls: "badge-yellow" },
  "terminé": { label: "Terminé", cls: "badge-blue" },
  "high": { label: "Élevé", cls: "badge-red" },
  "medium": { label: "Moyen", cls: "badge-yellow" },
  "low": { label: "Faible", cls: "badge-green" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, cls: "badge-gray" };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}