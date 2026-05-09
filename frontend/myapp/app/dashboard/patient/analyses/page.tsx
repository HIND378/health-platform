"use client";
import { useEffect, useState } from "react";
import { analysesApi } from "@/lib/api-client";
import { ResultatAnalyse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import StatusBadge from "@/components/StatusBadge";
import { FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientAnalysesPage() {
  const [analyses, setAnalyses] = useState<ResultatAnalyse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    analysesApi.getAll().then(a => {
      setAnalyses(a as ResultatAnalyse[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Mes résultats d'analyses" subtitle="Consultez vos résultats biologiques" />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : analyses.length === 0 ? (
        <div className="card">
          <EmptyState icon={<FlaskConical size={40} />} message="Aucune analyse enregistrée" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {analyses.map(a => (
            <div key={a.id} className="card" style={{ overflow: "hidden" }}>
              <div
                style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "rgba(59,158,255,0.1)", borderRadius: 10, padding: 10 }}>
                    <FlaskConical size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{a.type_analyse}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>
                      {format(new Date(a.date_resultat), "d MMMM yyyy", { locale: fr })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusBadge status={a.statut} />
                  {expanded === a.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>

              {expanded === a.id && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Valeurs</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                      {Object.entries(a.valeurs || {}).map(([key, val]) => (
                        <div key={key} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize", marginBottom: 4 }}>{key.replace(/_/g, " ")}</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "JetBrains Mono, monospace" }}>
                            {String(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}