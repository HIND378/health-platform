"use client";
import { useState, useRef, useEffect } from "react";
import { summaryApi, usersApi, dossiersApi, ordonnancesApi } from "@/lib/api-client";
import { Patient, DossierMedical, Ordonnance } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from "lucide-react";

interface ChatMsg { role: "user" | "assistant"; content: string; }

interface PatientSummary {
  resume: string;
  points_attention: string[];
  examens_suggeres: string[];
  priorite: string;
}

export default function MedecinIAPage() {
  const [tab, setTab] = useState<"summary" | "chat">("chat");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [summaryResult, setSummaryResult] = useState<PatientSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    usersApi.getPatients().then(p => setPatients(p as Patient[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    Promise.all([
      dossiersApi.getAll().catch(() => []),
      ordonnancesApi.getAll().catch(() => []),
    ]).then(([d, o]) => {
      const filteredDossiers = (d as DossierMedical[]).filter(x => x.patient_id === selectedPatient.id);
      setDossiers(filteredDossiers);
      const patientDossierIds = filteredDossiers.map(d => d.id);
      setOrdonnances((o as Ordonnance[]).filter(x => patientDossierIds.includes(x.dossier_id)));
    });
  }, [selectedPatient]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleSummary = async () => {
    if (!selectedPatient) return;
    setSummaryLoading(true);
    setSummaryResult(null);
    try {
      const age = selectedPatient.date_naissance
        ? Math.floor((Date.now() - new Date(selectedPatient.date_naissance).getTime()) / 3.156e10)
        : 40;
      const res = await summaryApi.patient({
        patient_name: `${selectedPatient.prenom} ${selectedPatient.nom}`,
        age,
        medical_history: dossiers.map(d => d.diagnostic).filter((diag): diag is string => diag !== undefined),
        medications: ordonnances.map(o => `${o.medicament} ${o.dosage}`),
        symptoms: symptoms ? symptoms.split(",").map(s => s.trim()) : [],
      });
      setSummaryResult(res as PatientSummary);
    } catch (err: unknown) {
      setSummaryResult({ resume: "Erreur: " + (err as Error).message, points_attention: [], examens_suggeres: [], priorite: "—" });
    }
    setSummaryLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setChatLoading(true);
    try {
      const res = await summaryApi.chat(input, messages);
      setMessages(m => [...m, { role: "assistant", content: res.response }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." }]);
    }
    setChatLoading(false);
  };

  const priorityColor: Record<string, string> = {
    urgente: "var(--danger)", haute: "var(--warning)", routine: "var(--success)"
  };

  return (
    <div>
      <PageHeader title="Assistant IA médical" subtitle="Résumés cliniques et chat médical alimentés par IA" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "chat", label: "Chat médical", icon: Bot },
          { key: "summary", label: "Résumé patient", icon: Sparkles },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} className={`btn ${tab === key ? "btn-primary" : "btn-ghost"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Chat */}
      {tab === "chat" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 240px)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3b9eff, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Assistant médical IA</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by Llama 3.1 · Pour usage médical professionnel uniquement</div>
            </div>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Bot size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>Posez vos questions médicales professionnelles</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {["Quels sont les critères diagnostiques du diabète de type 2 ?", "Interactions médicamenteuses Metformine et Ibuprofène ?", "Protocole de prise en charge d'une HTA de grade 2 ?"].map(q => (
                    <button key={q} onClick={() => setInput(q)} style={{ padding: "8px 14px", background: "rgba(59,158,255,0.08)", border: "1px solid rgba(59,158,255,0.2)", borderRadius: 99, fontSize: 12, color: "var(--accent)", cursor: "pointer", fontFamily: "Sora, sans-serif" }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: m.role === "user" ? "var(--accent)" : "rgba(255,255,255,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.role === "user" ? <User size={13} color="#fff" /> : <Bot size={13} color="var(--accent)" />}
                  </div>
                  <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={13} color="var(--accent)" />
                </div>
                <div className="chat-bubble-ai">
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChat} style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
            <input
              type="text"
              className="field-input"
              placeholder="Posez votre question médicale..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={chatLoading || !input.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      {tab === "summary" && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Paramètres</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="field-label">Patient</label>
                <select className="field-input" value={selectedPatient?.id || ""} onChange={e => setSelectedPatient(patients.find(p => p.id === e.target.value) || null)}>
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              {selectedPatient && (
                <>
                  <div style={{ padding: "12px 14px", background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 10, fontSize: 13 }}>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 4 }}>Données chargées</div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      {dossiers.length} dossier{dossiers.length > 1 ? "s" : ""} · {ordonnances.length} ordonnance{ordonnances.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Symptômes actuels (optionnel)</label>
                    <textarea className="field-input" placeholder="fatigue, soif excessive..." value={symptoms} onChange={e => setSymptoms(e.target.value)} style={{ minHeight: 70 }} />
                  </div>
                </>
              )}
              <button className="btn btn-primary" onClick={handleSummary} disabled={!selectedPatient || summaryLoading}>
                {summaryLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Génération...</> : <><Sparkles size={15} /> Générer le résumé</>}
              </button>
            </div>
          </div>

          <div>
            {!summaryResult && !summaryLoading && (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <Sparkles size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sélectionnez un patient et générez un résumé clinique IA</p>
              </div>
            )}
            {summaryLoading && (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 12px" }} />
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Analyse en cours...</p>
              </div>
            )}
            {summaryResult && !summaryLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Résumé clinique</div>
                  <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: 14 }}>{summaryResult.resume}</p>
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Priorité:</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: priorityColor[summaryResult.priorite] || "var(--text-secondary)", textTransform: "capitalize" }}>
                      {summaryResult.priorite}
                    </span>
                  </div>
                </div>

                {summaryResult.points_attention.length > 0 && (
                  <div className="card" style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <AlertCircle size={15} color="var(--warning)" />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Points d'attention</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {summaryResult.points_attention.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)", marginTop: 5, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summaryResult.examens_suggeres.length > 0 && (
                  <div className="card" style={{ padding: 22 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Examens suggérés</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {summaryResult.examens_suggeres.map((e, i) => (
                        <span key={i} className="badge badge-blue" style={{ fontSize: 12, padding: "5px 12px" }}>{e}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn btn-ghost btn-sm" onClick={() => setSummaryResult(null)} style={{ alignSelf: "flex-start" }}>
                  <RefreshCw size={13} /> Nouveau résumé
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}