"use client";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api-client";
import { Patient } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import { Users, Search, Droplets, Phone } from "lucide-react";

export default function MedecinPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    usersApi.getPatients().then(p => {
      setPatients(p as Patient[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || `${p.prenom} ${p.nom}`.toLowerCase().includes(q);
  });

  const bloodColors: Record<string, string> = {
    "A+": "#ff5757", "A-": "#ff8080",
    "B+": "#3b9eff", "B-": "#80bcff",
    "AB+": "#a855f7", "AB-": "#c084fc",
    "O+": "#00d4aa", "O-": "#66e6cc",
  };

  return (
    <div>
      <PageHeader
        title="Mes patients"
        subtitle={`${patients.length} patient${patients.length > 1 ? "s" : ""} suivi${patients.length > 1 ? "s" : ""}`}
      />

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 24 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          className="field-input"
          placeholder="Rechercher un patient..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Users size={40} />} message={search ? "Aucun patient trouvé" : "Aucun patient pour l'instant"} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: 20, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(0,212,170,0.2), rgba(59,158,255,0.2))",
                  border: "1px solid rgba(0,212,170,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#00d4aa",
                  flexShrink: 0
                }}>
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
                    {p.prenom} {p.nom}
                  </div>
                  {p.date_naissance && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      Né le {new Date(p.date_naissance).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
                {p.groupe_sanguin && (
                  <div style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: `${bloodColors[p.groupe_sanguin] || "#fff"}20`,
                    border: `1px solid ${bloodColors[p.groupe_sanguin] || "#fff"}40`,
                    fontSize: 12, fontWeight: 700,
                    color: bloodColors[p.groupe_sanguin] || "var(--text-secondary)",
                    display: "flex", alignItems: "center", gap: 4
                  }}>
                    <Droplets size={10} />
                    {p.groupe_sanguin}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.telephone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                    <Phone size={12} />
                    {p.telephone}
                  </div>
                )}
                
               
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}