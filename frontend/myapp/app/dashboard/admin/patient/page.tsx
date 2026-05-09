"use client";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api-client";
import { Patient } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import { Users, Search, Droplets, Phone, MapPin, Calendar } from "lucide-react";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    usersApi.getPatients().then(p => { setPatients(p as Patient[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.telephone?.includes(q);
  });

  const bloodColors: Record<string, string> = {
    "A+": "#ff5757", "A-": "#ff8080", "B+": "#3b9eff", "B-": "#80bcff",
    "AB+": "#a855f7", "AB-": "#c084fc", "O+": "#00d4aa", "O-": "#66e6cc",
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} patient${patients.length > 1 ? "s" : ""} enregistré${patients.length > 1 ? "s" : ""}`}
      />

      <div style={{ position: "relative", maxWidth: 380, marginBottom: 24 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input type="text" className="field-input" placeholder="Rechercher par nom ou téléphone..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Users size={40} />} message="Aucun patient trouvé" /></div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date de naissance</th>
                <th>Sexe</th>
                <th>Groupe sanguin</th>
                <th>Téléphone</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, rgba(59,158,255,0.2), rgba(0,212,170,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                        {p.prenom?.[0]}{p.nom?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{p.id?.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.date_naissance ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Calendar size={11} />
                        {new Date(p.date_naissance).toLocaleDateString("fr-FR")}
                      </div>
                    ) : "—"}
                  </td>
                  
                  <td>
                    {p.groupe_sanguin ? (
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: `${bloodColors[p.groupe_sanguin] || "#fff"}20`, border: `1px solid ${bloodColors[p.groupe_sanguin] || "#fff"}40`, fontSize: 12, fontWeight: 700, color: bloodColors[p.groupe_sanguin] || "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Droplets size={10} /> {p.groupe_sanguin}
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    {p.telephone ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Phone size={11} /> {p.telephone}
                      </div>
                    ) : "—"}
                  </td>
                  <td>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}