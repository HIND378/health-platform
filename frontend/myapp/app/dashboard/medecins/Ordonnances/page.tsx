"use client";
import { useEffect, useState } from "react";
import { ordonnancesApi, usersApi, notificationsApi } from "@/lib/api-client";
import { Ordonnance, Patient } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/Emptystate";
import { FileText, Plus, Edit2, Bell, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedecinOrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Ordonnance | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [error, setError] = useState("");

  const emptyForm = {
    patient_id: "", medicament: "", dosage: "", frequence: "",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "", renouvelable: false, dossier_id: undefined as string | undefined,
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [o, p] = await Promise.all([
      ordonnancesApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
    ]);
    setOrdonnances(o as Ordonnance[]);
    setPatients(p as Patient[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) {
        await ordonnancesApi.update(editing.id, {
          medicament: form.medicament, dosage: form.dosage,
          frequence: form.frequence, date_debut: form.date_debut,
          date_fin: form.date_fin || undefined, renouvelable: form.renouvelable,
        });
        setEditing(null);
      } else {
        await ordonnancesApi.create({ ...form, date_fin: form.date_fin || undefined });
        setShowCreate(false);
      }
      setForm(emptyForm);
      await load();
    } catch (err: unknown) { setError((err as Error).message); }
    setSaving(false);
  };

  const handleNotify = async (o: Ordonnance) => {
    const patient = patients.find(p => p.id === (o as any).patient_id);
    if (!patient) return;
    setNotifying(o.id);
    try {
      await notificationsApi.sendMedReminder({
        to_email: `${patient.prenom.toLowerCase()}.${patient.nom.toLowerCase()}@example.com`,
        patient_name: `${patient.prenom} ${patient.nom}`,
        medication: o.medicament,
        dosage: o.dosage,
      });
      alert("Rappel envoyé !");
    } catch { alert("Erreur d'envoi"); }
    setNotifying(null);
  };

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.prenom} ${p.nom}` : "—";
  };

  const OrdonnanceForm = () => (
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="field-label">Médicament</label>
            <input type="text" className="field-input" placeholder="ex: Metformine" value={form.medicament} onChange={e => setForm(f => ({ ...f, medicament: e.target.value }))} required />
          </div>
          <div>
            <label className="field-label">Dosage</label>
            <input type="text" className="field-input" placeholder="ex: 500mg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} required />
          </div>
        </div>
        <div>
          <label className="field-label">Fréquence</label>
          <input type="text" className="field-input" placeholder="ex: 2 fois par jour" value={form.frequence} onChange={e => setForm(f => ({ ...f, frequence: e.target.value }))} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="field-label">Date début</label>
            <input type="date" className="field-input" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} required />
          </div>
          <div>
            <label className="field-label">Date fin (optionnel)</label>
            <input type="date" className="field-input" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="renouvelable" checked={form.renouvelable} onChange={e => setForm(f => ({ ...f, renouvelable: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
          <label htmlFor="renouvelable" style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Ordonnance renouvelable</label>
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
        title="Ordonnances"
        subtitle="Gérez les prescriptions de vos patients"
        action={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><Plus size={16} /> Nouvelle ordonnance</button>}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : ordonnances.length === 0 ? (
        <div className="card"><EmptyState icon={<FileText size={40} />} message="Aucune ordonnance"
          action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Créer une ordonnance</button>} /></div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Fréquence</th>
                <th>Période</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordonnances.map(o => {
                const ordonnance = o as any;
                return (
                  <tr key={o.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{getPatientName(ordonnance.patient_id)}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{o.medicament}</div>
                      {o.renouvelable && <span className="badge badge-green" style={{ fontSize: 10, marginTop: 4 }}><RefreshCw size={8} /> Renouvelable</span>}
                    </td>
                    <td>{o.dosage}</td>
                    <td>{o.frequence}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>{format(new Date(o.date_debut), "d MMM yyyy", { locale: fr })}</div>
                      {o.date_fin && <div style={{ color: "var(--text-muted)" }}>→ {format(new Date(o.date_fin), "d MMM yyyy", { locale: fr })}</div>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ patient_id: ordonnance.patient_id, medicament: o.medicament, dosage: o.dosage, frequence: o.frequence, date_debut: o.date_debut.split("T")[0], date_fin: o.date_fin?.split("T")[0] || "", renouvelable: o.renouvelable, dossier_id: o.dossier_id }); setEditing(o); }}>
                          <Edit2 size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleNotify(o)} disabled={notifying === o.id} title="Envoyer rappel">
                          {notifying === o.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Bell size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <Modal title="Nouvelle ordonnance" onClose={() => setShowCreate(false)}><OrdonnanceForm /></Modal>}
      {editing && <Modal title="Modifier l'ordonnance" onClose={() => setEditing(null)}><OrdonnanceForm /></Modal>}
    </div>
  );
}