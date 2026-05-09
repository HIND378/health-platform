"use client";
import { useState } from "react";
import { predictApi } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import RiskMeter from "@/components/RiskMeter";
import { Brain, Heart, Droplet } from "lucide-react";

type PredResult = { prediction: number; probability: number; risk_level: "low" | "medium" | "high" } | null;

export default function PatientPredictPage() {
  const [tab, setTab] = useState<"diabetes" | "cardio">("diabetes");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredResult>(null);
  const [error, setError] = useState("");

  const [diabetes, setDiabetes] = useState({
    pregnancies: 0, glucose: 120, blood_pressure: 80, skin_thickness: 20,
    insulin: 80, bmi: 25, diabetes_pedigree: 0.5, age: 35,
  });

  const [cardio, setCardio] = useState({
    age: 55, sex: 1, cp: 0, trestbps: 130, chol: 240, fbs: 0,
    restecg: 0, thalach: 150, exang: 0, oldpeak: 1.0, slope: 1, ca: 0, thal: 2,
  });

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = tab === "diabetes"
        ? await predictApi.diabetes(diabetes)
        : await predictApi.cardio(cardio);
      setResult(res as PredResult);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, min, max, step }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
  }) => (
    <div>
      <label className="field-label">{label}</label>
      <input
        type="number"
        className="field-input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step || 1}
      />
    </div>
  );

  return (
    <div>
      <PageHeader title="Prédiction IA" subtitle="Évaluation du risque de maladies chroniques par intelligence artificielle" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "diabetes", label: "Diabète", icon: Droplet },
          { key: "cardio", label: "Cardiovasculaire", icon: Heart },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key as "diabetes" | "cardio"); setResult(null); }}
            className={`btn ${tab === key ? "btn-primary" : "btn-ghost"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 280px" : "1fr", gap: 24 }}>
        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Brain size={20} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>
              {tab === "diabetes" ? "Paramètres — Diabète" : "Paramètres — Cardiovasculaire"}
            </h2>
          </div>

          {tab === "diabetes" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <Field label="Grossesses" value={diabetes.pregnancies} onChange={v => setDiabetes(f => ({ ...f, pregnancies: v }))} min={0} max={20} />
              <Field label="Glucose (mg/dL)" value={diabetes.glucose} onChange={v => setDiabetes(f => ({ ...f, glucose: v }))} min={50} max={300} />
              <Field label="Pression artérielle" value={diabetes.blood_pressure} onChange={v => setDiabetes(f => ({ ...f, blood_pressure: v }))} min={40} max={200} />
              <Field label="Épaisseur peau (mm)" value={diabetes.skin_thickness} onChange={v => setDiabetes(f => ({ ...f, skin_thickness: v }))} min={0} max={100} />
              <Field label="Insuline (µU/mL)" value={diabetes.insulin} onChange={v => setDiabetes(f => ({ ...f, insulin: v }))} min={0} max={800} />
              <Field label="IMC" value={diabetes.bmi} onChange={v => setDiabetes(f => ({ ...f, bmi: v }))} min={10} max={60} step={0.1} />
              <Field label="Hérédité diabétique" value={diabetes.diabetes_pedigree} onChange={v => setDiabetes(f => ({ ...f, diabetes_pedigree: v }))} min={0} max={3} step={0.01} />
              <Field label="Âge" value={diabetes.age} onChange={v => setDiabetes(f => ({ ...f, age: v }))} min={10} max={120} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <Field label="Âge" value={cardio.age} onChange={v => setCardio(f => ({ ...f, age: v }))} min={20} max={100} />
              <div>
                <label className="field-label">Sexe</label>
                <select className="field-input" value={cardio.sex} onChange={e => setCardio(f => ({ ...f, sex: Number(e.target.value) }))}>
                  <option value={1}>Homme</option>
                  <option value={0}>Femme</option>
                </select>
              </div>
              <div>
                <label className="field-label">Type douleur thoracique (0-3)</label>
                <select className="field-input" value={cardio.cp} onChange={e => setCardio(f => ({ ...f, cp: Number(e.target.value) }))}>
                  <option value={0}>Angine typique</option>
                  <option value={1}>Angine atypique</option>
                  <option value={2}>Douleur non angineuse</option>
                  <option value={3}>Asymptomatique</option>
                </select>
              </div>
              <Field label="TA repos (mmHg)" value={cardio.trestbps} onChange={v => setCardio(f => ({ ...f, trestbps: v }))} min={80} max={220} />
              <Field label="Cholestérol (mg/dL)" value={cardio.chol} onChange={v => setCardio(f => ({ ...f, chol: v }))} min={100} max={600} />
              <div>
                <label className="field-label">Glycémie à jeun &gt; 120</label>
                <select className="field-input" value={cardio.fbs} onChange={e => setCardio(f => ({ ...f, fbs: Number(e.target.value) }))}>
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>
              <Field label="FC max (bpm)" value={cardio.thalach} onChange={v => setCardio(f => ({ ...f, thalach: v }))} min={60} max={220} />
              <div>
                <label className="field-label">Angor à l'effort</label>
                <select className="field-input" value={cardio.exang} onChange={e => setCardio(f => ({ ...f, exang: Number(e.target.value) }))}>
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>
              <Field label="Dépression ST" value={cardio.oldpeak} onChange={v => setCardio(f => ({ ...f, oldpeak: v }))} min={0} max={10} step={0.1} />
              <Field label="Nbre vaisseaux (0-4)" value={cardio.ca} onChange={v => setCardio(f => ({ ...f, ca: v }))} min={0} max={4} />
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,87,87,0.08)", border: "1px solid rgba(255,87,87,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary btn-lg" onClick={handlePredict} disabled={loading}>
              {loading ? <div className="spinner" /> : <><Brain size={16} /> Analyser</>}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <RiskMeter
              probability={result.probability}
              riskLevel={result.risk_level}
              label={tab === "diabetes" ? "Diabète" : "Maladie cardiaque"}
            />
            <div style={{
              padding: "12px 16px", borderRadius: 10, width: "100%",
              background: result.risk_level === "high" ? "rgba(255,87,87,0.08)" : result.risk_level === "medium" ? "rgba(255,169,77,0.08)" : "rgba(81,207,102,0.08)",
              border: `1px solid ${result.risk_level === "high" ? "rgba(255,87,87,0.2)" : result.risk_level === "medium" ? "rgba(255,169,77,0.2)" : "rgba(81,207,102,0.2)"}`,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {result.risk_level === "high"
                  ? "⚠️ Risque élevé détecté. Consultez un médecin rapidement."
                  : result.risk_level === "medium"
                  ? "⚡ Risque modéré. Un suivi médical est recommandé."
                  : "✅ Risque faible. Continuez votre mode de vie sain."}
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
              Ce résultat est indicatif. Seul un médecin peut établir un diagnostic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}