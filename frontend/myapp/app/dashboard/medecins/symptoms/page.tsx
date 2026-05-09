"use client";
import { useState } from "react";
import { symptomsApi } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import { Activity, Plus, X, Search, AlertTriangle } from "lucide-react";

const KNOWN_SYMPTOMS = [
  "fatigue", "soif", "douleur thoracique", "essoufflement", "vision floue",
  "maux de tete", "palpitations", "urination frequente", "transpiration", "douleur bras"
];

type SymptomResult = {
  possible_conditions: { condition: string; matches: number; urgency: "urgent" | "normal" }[];
  disclaimer: string;
};

export default function PatientSymptomsPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [age, setAge] = useState(35);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);

  const addSymptom = (s: string) => {
    if (!symptoms.includes(s)) setSymptoms(prev => [...prev, s]);
  };
  const removeSymptom = (s: string) => setSymptoms(prev => prev.filter(x => x !== s));

  const handleCustomAdd = () => {
    if (custom.trim() && !symptoms.includes(custom.trim().toLowerCase())) {
      addSymptom(custom.trim().toLowerCase());
      setCustom("");
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    try {
      const res = await symptomsApi.analyze(symptoms, age);
      setResult(res as SymptomResult);
    } catch {}
    setLoading(false);
  };

  const urgentCount = result?.possible_conditions.filter(c => c.urgency === "urgent").length || 0;

  return (
    <div>
      <PageHeader
        title="Analyse de symptômes"
        subtitle="L'IA identifie les conditions possibles — consultez un médecin pour un diagnostic"
      />

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 360px" : "1fr", gap: 24 }}>
        <div>
          {/* Symptom chips */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Symptômes courants</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {KNOWN_SYMPTOMS.map(s => (
                <button
                  key={s}
                  onClick={() => symptoms.includes(s) ? removeSymptom(s) : addSymptom(s)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 99,
                    border: `1px solid ${symptoms.includes(s) ? "var(--accent)" : "var(--border)"}`,
                    background: symptoms.includes(s) ? "rgba(59,158,255,0.12)" : "rgba(255,255,255,0.02)",
                    color: symptoms.includes(s) ? "var(--accent)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "Sora, sans-serif",
                    transition: "all 0.15s",
                    textTransform: "capitalize"
                  }}
                >
                  {symptoms.includes(s) ? "✓ " : ""}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Custom symptom */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Ajouter un symptôme</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                className="field-input"
                placeholder="ex: nausée, douleur abdominale..."
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
              />
              <button className="btn btn-secondary" onClick={handleCustomAdd}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Selected */}
          {symptoms.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Symptômes sélectionnés ({symptoms.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {symptoms.map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(59,158,255,0.1)", border: "1px solid rgba(59,158,255,0.25)", borderRadius: 99 }}>
                    <span style={{ fontSize: 13, color: "var(--accent)", textTransform: "capitalize" }}>{s}</span>
                    <button onClick={() => removeSymptom(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0, display: "flex" }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Age + analyze */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ width: 140 }}>
              <label className="field-label">Votre âge</label>
              <input
                type="number"
                className="field-input"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                min={1} max={120}
              />
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAnalyze}
              disabled={loading || symptoms.length === 0}
            >
              {loading ? <div className="spinner" /> : <><Search size={16} /> Analyser</>}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Activity size={18} color="var(--accent)" />
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Résultats</h3>
                {urgentCount > 0 && (
                  <span className="badge badge-red" style={{ marginLeft: "auto" }}>
                    <AlertTriangle size={10} /> {urgentCount} urgent
                  </span>
                )}
              </div>

              {result.possible_conditions.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Aucune correspondance trouvée.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.possible_conditions.map((c, i) => (
                    <div key={c.condition} style={{
                      padding: "14px 16px",
                      background: c.urgency === "urgent" ? "rgba(255,87,87,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${c.urgency === "urgent" ? "rgba(255,87,87,0.2)" : "var(--border)"}`,
                      borderRadius: 12
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>#{i + 1}</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{c.condition}</span>
                        </div>
                        <span className={`badge ${c.urgency === "urgent" ? "badge-red" : "badge-green"}`}>
                          {c.urgency === "urgent" ? "Urgent" : "Normal"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                          <div style={{ height: 4, width: `${(c.matches / symptoms.length) * 100}%`, background: c.urgency === "urgent" ? "var(--danger)" : "var(--accent)", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>{c.matches} corresp.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                ⚕️ {result.disclaimer}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}