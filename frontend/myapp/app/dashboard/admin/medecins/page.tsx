"use client";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api-client";
import { Medecin } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import { Stethoscope, Search, Phone, Mail, Award } from "lucide-react";

const specialtyColors: Record<string, string> = {
  "cardiologie": "#ff5757",
  "neurologie": "#a855f7",
  "pédiatrie": "#3b9eff",
  "gynécologie": "#ff69b4",
  "dermatologie": "#ffa94d",
  "ophtalmologie": "#00d4aa",
  "orthopédie": "#51cf66",
  "psychiatrie": "#e879f9",
  "endocrinologie": "#fb923c",
  "généraliste": "#8ba3c9",
};

function getSpecialtyColor(spec?: string): string {
  if (!spec) return "var(--text-muted)";
  const lower = spec.toLowerCase();
  for (const [k, v] of Object.entries(specialtyColors)) {
    if (lower.includes(k)) return v;
  }
  return "var(--accent)";
}

export default function AdminMedecinsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    usersApi.getMedecins().then(m => { setMedecins(m as Medecin[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase();
    return !q || `${m.prenom} ${m.nom}`.toLowerCase().includes(q) || m.specialite?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Médecins"
        subtitle={`${medecins.length} médecin${medecins.length > 1 ? "s" : ""} enregistré${medecins.length > 1 ? "s" : ""}`}
      />

      <div style={{ position: "relative", maxWidth: 380, marginBottom: 24 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input type="text" className="field-input" placeholder="Rechercher par nom ou spécialité..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Stethoscope size={40} />} message="Aucun médecin trouvé" /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(m => {
            const color = getSpecialtyColor(m.specialite ?? undefined);
            return (
              <div key={m.id} className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 13,
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color,
                    flexShrink: 0
                  }}>
                    Dr
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                      Dr. {m.prenom} {m.nom}
                    </div>
                    {m.specialite && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, padding: "2px 8px", borderRadius: 99, background: `${color}12`, border: `1px solid ${color}25` }}>
                        <Award size={10} color={color} />
                        <span style={{ fontSize: 11, fontWeight: 600, color }}>{m.specialite}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  
                  {m.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden" }}>
                      <Mail size={12} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
                    ID: {m.id?.slice(0, 12)}...
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}