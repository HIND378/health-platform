"use client";
import { useEffect, useState } from "react";
import { dossiersApi } from "@/lib/api-client";
import { DossierMedical } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import { FolderOpen, Calendar, Tag, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientDossierPage() {
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DossierMedical | null>(null);

  useEffect(() => {
    dossiersApi.getAll().then(d => {
      setDossiers(d as DossierMedical[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Mon dossier médical"
        subtitle="Consultez vos diagnostics et antécédents"
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : dossiers.length === 0 ? (
        <div className="card">
          <EmptyState />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dossiers.map(d => (
              <div
                key={d.id}
                onClick={() => setSelected(selected?.id === d.id ? null : d)}
                className="card"
                style={{
                  padding: 20, cursor: "pointer",
                  borderColor: selected?.id === d.id ? "var(--accent)" : undefined,
                  background: selected?.id === d.id ? "rgba(59,158,255,0.05)" : undefined,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <FileText size={15} color="var(--accent)" />
                      <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{d.diagnostic}</span>
                    </div>
                    {d.icd10_code && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                        <Tag size={12} color="var(--text-muted)" />
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{d.icd10_code}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", fontSize: 12 }}>
                      <Calendar size={12} />
                      {format(new Date(d.date_consultation), "d MMMM yyyy", { locale: fr })}
                    </div>
                  </div>
                </div>

                {d.antecedents && (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <strong style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Antécédents</strong>
                    <p style={{ marginTop: 4 }}>{d.antecedents}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selected && (
            <div className="card" style={{ padding: 24, position: "sticky", top: 24, alignSelf: "flex-start" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Détail du dossier</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Diagnostic</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{selected.diagnostic}</div>
                </div>
                {selected.icd10_code && (
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Code CIM-10</div>
                    <span className="badge badge-blue">{selected.icd10_code}</span>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Date consultation</div>
                  <div style={{ color: "var(--text-secondary)" }}>{format(new Date(selected.date_consultation), "EEEE d MMMM yyyy", { locale: fr })}</div>
                </div>
                {selected.antecedents && (
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Antécédents médicaux</div>
                    <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border)" }}>
                      {selected.antecedents}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}