"use client";
import { useEffect, useState } from "react";
import { rdvApi, usersApi } from "@/lib/api-client";
import { RendezVous, Medecin } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/Emptystate";
import { Calendar, Plus, X, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientRdvPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    medecin_id: "",
    date_heure: "",
    duree_min: 30,
    motif: "",
  });

  const load = async () => {
    const [r, m] = await Promise.all([
      rdvApi.getAll().catch(() => []),
      usersApi.getMedecins().catch(() => []),
    ]);
    setRdvs(r as RendezVous[]);
    setMedecins(m as Medecin[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await rdvApi.create(form);
      setShowCreate(false);
      setForm({ medecin_id: "", date_heure: "", duree_min: 30, motif: "" });
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    setCancelling(id);
    try {
      await rdvApi.cancel(id);
      await load();
    } catch {}
    setCancelling(null);
  };

  const grouped = {
    upcoming: rdvs.filter(r => ["en_attente", "accepté"].includes(r.statut)),
    past: rdvs.filter(r => ["refusé", "annulé"].includes(r.statut) || new Date(r.date_heure) < new Date()),
  };

  return (
    <div>
      <PageHeader
        title="Mes rendez-vous"
        subtitle="Gérez vos consultations médicales"
        action={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Prendre RDV
          </button>
        }
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : rdvs.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 16 }}>
            <Calendar size={40} style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Aucun rendez-vous pour l'instant</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Prendre mon premier RDV
            </button>
          </div>
        </div>
      ) : (
        <>
          {grouped.upcoming.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>À venir</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & heure</th>
                    <th>Durée</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.upcoming.map(rdv => (
                    <tr key={rdv.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {format(new Date(rdv.date_heure), "d MMM yyyy", { locale: fr })}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Clock size={11} />
                          {format(new Date(rdv.date_heure), "HH:mm")}
                        </div>
                      </td>
                      <td>{rdv.duree_min} min</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rdv.motif}</td>
                      <td><StatusBadge status={rdv.statut} /></td>
                      <td>
                        {rdv.statut !== "annulé" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(rdv.id)}
                            disabled={cancelling === rdv.id}
                          >
                            {cancelling === rdv.id ? <div className="spinner" /> : <><X size={12} /> Annuler</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {grouped.past.length > 0 && (
            <div className="card">
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Historique</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & heure</th>
                    <th>Durée</th>
                    <th>Motif</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.past.map(rdv => (
                    <tr key={rdv.id} style={{ opacity: 0.6 }}>
                      <td>{format(new Date(rdv.date_heure), "d MMM yyyy HH:mm", { locale: fr })}</td>
                      <td>{rdv.duree_min} min</td>
                      <td>{rdv.motif}</td>
                      <td><StatusBadge status={rdv.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <Modal title="Prendre un rendez-vous" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="field-label">
                  <User size={12} style={{ display: "inline", marginRight: 4 }} />
                  Médecin
                </label>
                <select
                  className="field-input"
                  value={form.medecin_id}
                  onChange={e => setForm(f => ({ ...f, medecin_id: e.target.value }))}
                  required
                >
                  <option value="">Choisir un médecin</option>
                  {medecins.map((m: Medecin) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.prenom} {m.nom} {m.specialite ? `— ${m.specialite}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Date & heure</label>
                <input
                  type="datetime-local"
                  className="field-input"
                  value={form.date_heure}
                  onChange={e => setForm(f => ({ ...f, date_heure: e.target.value }))}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="field-label">Durée (minutes)</label>
                <select
                  className="field-input"
                  value={form.duree_min}
                  onChange={e => setForm(f => ({ ...f, duree_min: Number(e.target.value) }))}
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 heure</option>
                </select>
              </div>

              <div>
                <label className="field-label">Motif de consultation</label>
                <textarea
                  className="field-input"
                  placeholder="Décrivez le motif de votre consultation..."
                  value={form.motif}
                  onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                  required
                />
              </div>

              {error && (
                <div style={{ background: "rgba(255,87,87,0.08)", border: "1px solid rgba(255,87,87,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <div className="spinner" /> : <><Plus size={15} /> Confirmer</>}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}