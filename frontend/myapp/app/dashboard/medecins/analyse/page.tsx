"use client";
import { useEffect, useState } from "react";
import { analysesApi, usersApi } from "@/lib/api-client";
import { ResultatAnalyse, Patient } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/Emptystate";
import { FlaskConical, Plus, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedecinAnalysesPage() {
  const [analyses, setAnalyses] = useState<ResultatAnalyse[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ResultatAnalyse | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    patient_id: "", type_analyse: "", valeursRaw: "{}", statut: "normal",
    date_resultat: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [a, p] = await Promise.all([
      analysesApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
    ]);
    setAnalyses(a as ResultatAnalyse[]);
    setPatients(p as Patient[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      let valeurs: Record<string, unknown> = {};
      try { valeurs = JSON.parse(form.valeursRaw); } catch { throw new Error("Format JSON invalide pour les valeurs"); }

      if (editing) {
        await analysesApi.update(editing.id, { type_analyse: form.type_analyse, valeurs, statut: form.statut, date_resultat: form.date_resultat });
        setEditing(null);
      } else {
        await analysesApi.create({ patient_id: form.patient_id, type_analyse: form.type_analyse, valeurs, statut: form.statut, date_resultat: form.date_resultat });
        setShowCreate(false);
      }
      setForm(emptyForm);
      await load();
    } catch (err: unknown) { setError((err as Error).message); }
    setSaving(false);
  };

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.prenom} ${p.nom}` : "—";
  };

  const AnalyseForm = () => (
    <form onSubmit={handleSave}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {!editing && (
          <div>
            <label className="field-label">Patient</label>
            <select className="field-input" value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))} required>
              <option value="">Sélectionner un patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="field-label">Type d'analyse</label>
          <input type="text" className="field-input" placeholder="ex: Bilan sanguin, Glycémie à jeun..." value={form.type_analyse} onChange={e => setForm(f => ({ ...f, type_analyse: e.target.value }))} required />
        </div>
        <div>
          <label className="field-label">Statut</label>
          <select className="field-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            <option value="normal">Normal</option>
            <option value="anormal">Anormal</option>
            <option value="pending">En attente</option>
            <option value="terminé">Terminé</option>
          </select>
        </div>
        <div>
          <label className="field-label">
            Valeurs (JSON)
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6, textTransform: "none" }}>ex: {`{"glucose": "5.4 mmol/L", "hba1c": "6.2%"}`}</span>
          </label>
          <textarea
            className="field-input mono"
            value={form.valeursRaw}
            onChange={e => setForm(f => ({ ...f, valeursRaw: e.target.value }))}
            style={{ minHeight: 100, fontSize: 13 }}
            required
          />
        </div>
        <div>
          <label className="field-label">Date du résultat</label>
          <input type="date" className="field-input" value={form.date_resultat} onChange={e => setForm(f => ({ ...f, date_resultat: e.target.value }))} required />
        </div>
        {error && <div style={{ padding: "10px 14px", background: "rgba(255,87,87,0.08)", border: "1px solid rgba(255,87,87,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={() => { setShowCreate(false); setEditing(null); }}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" /> : editing ? "Mettre à jour" : <><Plus size={15} /> Enregistrer</>}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Résultats d'analyses"
        subtitle="Saisissez et gérez les résultats biologiques"
        action={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><Plus size={16} /> Nouveau résultat</button>}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : analyses.length === 0 ? (
        <div className="card"><EmptyState icon={<FlaskConical size={40} />} message="Aucun résultat d'analyse"
          action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Saisir un résultat</button>} /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analyses.map(a => (
            <div key={a.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "rgba(59,158,255,0.1)", borderRadius: 10, padding: 10 }}>
                    <FlaskConical size={16} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{a.type_analyse}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {getPatientName(a.patient_id)} · {format(new Date(a.date_resultat), "d MMM yyyy", { locale: fr })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StatusBadge status={a.statut} />
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setForm({ patient_id: a.patient_id, type_analyse: a.type_analyse, valeursRaw: JSON.stringify(a.valeurs, null, 2), statut: a.statut, date_resultat: a.date_resultat.split("T")[0] }); setEditing(a); }}>
                    <Edit2 size={12} />
                  </button>
                  {expanded === a.id ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                </div>
              </div>
              {expanded === a.id && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ paddingTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                    {Object.entries(a.valeurs || {}).map(([k, v]) => (
                      <div key={k} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize", marginBottom: 4 }}>{k.replace(/_/g, " ")}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "JetBrains Mono, monospace" }}>{String(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && <Modal title="Nouveau résultat d'analyse" onClose={() => setShowCreate(false)} wide><AnalyseForm /></Modal>}
      {editing && <Modal title="Modifier le résultat" onClose={() => setEditing(null)} wide><AnalyseForm /></Modal>}
    </div>
  );
}