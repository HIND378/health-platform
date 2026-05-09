"use client";
import { useEffect, useState } from "react";
import { rdvApi } from "@/lib/api-client";
import { RendezVous } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/Emptystate";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedecinRdvPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "en_attente" | "accepté" | "refusé" | "annulé">("all");

  const load = () => {
    rdvApi.getAll().then(r => {
      setRdvs(r as RendezVous[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string, statut: "accepté" | "refusé") => {
    setUpdating(id);
    try {
      await rdvApi.update(id, { statut });
      await load();
    } catch {}
    setUpdating(null);
  };

  const filtered = filter === "all" ? rdvs : rdvs.filter(r => r.statut === filter);

  const tabs = [
    { key: "all", label: "Tous", count: rdvs.length },
    { key: "en_attente", label: "En attente", count: rdvs.filter(r => r.statut === "en_attente").length },
    { key: "accepté", label: "Acceptés", count: rdvs.filter(r => r.statut === "accepté").length },
    { key: "refusé", label: "Refusés", count: rdvs.filter(r => r.statut === "refusé").length },
    { key: "annulé", label: "Annulés", count: rdvs.filter(r => r.statut === "annulé").length },
  ];

  return (
    <div>
      <PageHeader title="Gestion des rendez-vous" subtitle="Acceptez ou refusez les demandes de vos patients" />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as typeof filter)}
            className={`btn btn-sm ${filter === t.key ? "btn-primary" : "btn-ghost"}`}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 2,
                background: filter === t.key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                borderRadius: 99, padding: "1px 7px", fontSize: 11
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Calendar size={40} />} message="Aucun rendez-vous dans cette catégorie" />
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & heure</th>
                <th>Durée</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rdv => (
                <tr key={rdv.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>
                      {format(new Date(rdv.date_heure), "d MMM yyyy", { locale: fr })}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Clock size={11} />
                      {format(new Date(rdv.date_heure), "HH:mm")}
                    </div>
                  </td>
                  <td>{rdv.duree_min} min</td>
                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                    {rdv.motif}
                  </td>
                  <td><StatusBadge status={rdv.statut} /></td>
                  <td>
                    {rdv.statut === "en_attente" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: "rgba(81,207,102,0.1)", color: "var(--success)", border: "1px solid rgba(81,207,102,0.2)" }}
                          onClick={() => handleUpdate(rdv.id, "accepté")}
                          disabled={updating === rdv.id}
                        >
                          {updating === rdv.id ? <div className="spinner" /> : <><CheckCircle size={12} /> Accepter</>}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUpdate(rdv.id, "refusé")}
                          disabled={updating === rdv.id}
                        >
                          <XCircle size={12} /> Refuser
                        </button>
                      </div>
                    )}
                    {rdv.statut !== "en_attente" && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
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