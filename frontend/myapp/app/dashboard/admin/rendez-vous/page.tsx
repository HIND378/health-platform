"use client";
import { useEffect, useState } from "react";
import { rdvApi, notificationsApi, usersApi } from "@/lib/api-client";
import { RendezVous, Patient, Medecin } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/Emptystate";
import { Calendar, Search, Bell, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminRendezVousPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notifying, setNotifying] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      rdvApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
      usersApi.getMedecins().catch(() => []),
    ]).then(([r, p, m]) => {
      setRdvs(r as RendezVous[]);
      setPatients(p as Patient[]);
      setMedecins(m as Medecin[]);
      setLoading(false);
    });
  }, []);

  const getPatientName = (id: string) => {
    const p = patients.find(x => x.id === id);
    return p ? `${p.prenom} ${p.nom}` : "—";
  };
  const getMedecinName = (id: string) => {
    const m = medecins.find(x => x.id === id);
    return m ? `Dr. ${m.prenom} ${m.nom}` : "—";
  };

  const handleReminder = async (rdv: RendezVous) => {
    const patient = patients.find(p => p.id === rdv.patient_id);
    const medecin = medecins.find(m => m.id === rdv.medecin_id);
    if (!patient || !medecin) return;
    setNotifying(rdv.id);
    try {
      await notificationsApi.sendRdvReminder({
        to_email: `${patient.prenom.toLowerCase()}.${patient.nom.toLowerCase()}@example.com`,
        patient_name: `${patient.prenom} ${patient.nom}`,
        doctor_name: `${medecin.prenom} ${medecin.nom}`,
        rdv_time: format(new Date(rdv.date_heure), "d MMMM yyyy à HH:mm", { locale: fr }),
      });
      alert("Rappel envoyé !");
    } catch { alert("Erreur d'envoi"); }
    setNotifying(null);
  };

  const filtered = rdvs.filter(r => {
    if (filter !== "all" && r.statut !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return getPatientName(r.patient_id).toLowerCase().includes(q) ||
        getMedecinName(r.medecin_id).toLowerCase().includes(q) ||
        (r.motif && r.motif.toLowerCase().includes(q));
    }
    return true;
  });

  const counts = {
    all: rdvs.length,
    en_attente: rdvs.filter(r => r.statut === "en_attente").length,
    "accepté": rdvs.filter(r => r.statut === "accepté").length,
    "refusé": rdvs.filter(r => r.statut === "refusé").length,
    "annulé": rdvs.filter(r => r.statut === "annulé").length,
  };

  return (
    <div>
      <PageHeader title="Tous les rendez-vous" subtitle={`${rdvs.length} rendez-vous au total`} />

      {/* Filters row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" className="field-input" placeholder="Rechercher patient, médecin, motif..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(counts).map(([key, count]) => (
            <button key={key} onClick={() => setFilter(key)} className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-ghost"}`}>
              {key === "all" ? "Tous" : key}
              <span style={{ background: filter === key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)", borderRadius: 99, padding: "1px 6px", fontSize: 10 }}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Calendar size={40} />} message="Aucun rendez-vous trouvé" /></div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & heure</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Motif</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Rappel</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rdv => (
                <tr key={rdv.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>
                      {format(new Date(rdv.date_heure), "d MMM yyyy", { locale: fr })}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {format(new Date(rdv.date_heure), "HH:mm")}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{getPatientName(rdv.patient_id)}</td>
                  <td style={{ color: "#00d4aa" }}>{getMedecinName(rdv.medecin_id)}</td>
                  <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rdv.motif}</td>
                  <td>{rdv.duree_min} min</td>
                  <td><StatusBadge status={rdv.statut} /></td>
                  <td>
                    {rdv.statut === "accepté" && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleReminder(rdv)}
                        disabled={notifying === rdv.id}
                        title="Envoyer rappel"
                      >
                        {notifying === rdv.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Bell size={12} />}
                      </button>
                    )}
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