"use client";
import { useEffect, useState } from "react";
import { dossiersApi, usersApi } from "@/lib/api-client";
import { DossierMedical, Patient } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/Emptystate";
import { FolderOpen, Plus, Edit2, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedecinDossiersPage() {
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DossierMedical | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_id: "", diagnostic: "", antecedents: "", icd10_code: "",
    date_consultation: new Date().toISOString().split("T")[0],
  });

  const load = async () => {
    const [d, p] = await Promise.all([
      dossiersApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
    ]);
    setDossiers(d as DossierMedical[]);
    setPatients(p as Patient[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ patient_id: "", diagnostic: "", antecedents: "", icd10_code: "", date_consultation: new Date().toISOString().split("T")[0] });
    setError("");
    setShowCreate(true);
  };

  const openEdit = (d: DossierMedical) => {
    setForm({
      patient_id: d.patient_id || "",
      diagnostic: d.diagnostic || "",
      antecedents: d.antecedents || "",
      icd10_code: d.icd10_code || "",
      date_consultation: d.date_consultation ? d.date_consultation.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setEditing(d);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await dossiersApi.update(editing.id, {
          diagnostic: form.diagnostic,
          antecedents: form.antecedents,
          icd10_code: form.icd10_code,
          date_consultation: form.date_consultation,
        });
        setEditing(null);
      } else {
        await dossiersApi.create(form);
        setShowCreate(false);
      }
      await load();
    } catch (err: unknown) { setError((err as Error).message); }
    setSaving(false);
  };

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.prenom} ${p.nom}` : "Patient inconnu";
  };

  const DossierForm = () => (
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
          <label className="field-label">Diagnostic</label>
          <input type="text" className="field-input" placeholder="ex: Diabète de type 2" value={form.diagnostic} onChange={e => setForm(f => ({ ...f, diagnostic: e.target.value }))} required />
        </div>
        <div>
          <label className="field-label">Code CIM-10</label>
          <input type="text" className="field-input" placeholder="ex: E11.9" value={form.icd10_code} onChange={e => setForm(f => ({ ...f, icd10_code: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Antécédents médicaux</label>
          <textarea className="field-input" placeholder="Antécédents pertinents..." value={form.antecedents} onChange={e => setForm(f => ({ ...f, antecedents: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Date de consultation</label>
          <input type="date" className="field-input" value={form.date_consultation} onChange={e => setForm(f => ({ ...f, date_consultation: e.target.value }))} required />
        </div>
        {error && <div style={{ padding: "10px 14px", background: "rgba(255,87,87,0.08)", border: "1px solid rgba(255,87,87,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={() => { setShowCreate(false); setEditing(null); }}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" /> : editing ? "Mettre à jour" : <><Plus size={15} /> Créer</>}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Dossiers médicaux"
        subtitle="Gérez les dossiers de vos patients"
        action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nouveau dossier</button>}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : dossiers.length === 0 ? (
        <div className="card"><EmptyState icon={<FolderOpen size={40} />} message="Aucun dossier médical"
          action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Créer un dossier</button>} /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dossiers.map(d => (
            <div key={d.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ background: "rgba(59,158,255,0.1)", borderRadius: 8, padding: 8 }}>
                      <FolderOpen size={16} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{d.diagnostic}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>Patient: {getPatientName(d.patient_id)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                    {d.icd10_code && <span className="badge badge-blue"><Tag size={9} /> {d.icd10_code}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                      <Calendar size={12} />
                      {format(new Date(d.date_consultation), "d MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {d.antecedents && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, borderLeft: "2px solid var(--border-hover)" }}>
                      {d.antecedents}
                    </div>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)} style={{ marginLeft: 12, flexShrink: 0 }}>
                  <Edit2 size={13} /> Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <Modal title="Nouveau dossier médical" onClose={() => setShowCreate(false)}><DossierForm /></Modal>}
      {editing && <Modal title="Modifier le dossier" onClose={() => setEditing(null)}><DossierForm /></Modal>}
    </div>
  );
}