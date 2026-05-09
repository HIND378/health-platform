"use client";
import { useEffect, useState } from "react";
import { ordonnancesApi } from "@/lib/api-client";
import { Ordonnance } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/Emptystate";
import { FileText, RefreshCw, Calendar, Pill } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientOrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordonnancesApi.getAll().then(o => {
      setOrdonnances(o as Ordonnance[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const active = ordonnances.filter(o => !o.date_fin || new Date(o.date_fin) >= new Date());
  const expired = ordonnances.filter(o => o.date_fin && new Date(o.date_fin) < new Date());

  const OrdonnanceCard = ({ o, dim }: { o: Ordonnance; dim?: boolean }) => (
    <div style={{
      padding: 20,
      background: dim ? "rgba(255,255,255,0.01)" : "rgba(255,169,77,0.04)",
      border: `1px solid ${dim ? "var(--border)" : "rgba(255,169,77,0.15)"}`,
      borderRadius: 14,
      opacity: dim ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: dim ? "rgba(139,163,201,0.1)" : "rgba(255,169,77,0.12)", borderRadius: 8, padding: 8 }}>
            <Pill size={16} color={dim ? "var(--text-muted)" : "var(--warning)"} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{o.medicament}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>{o.dosage}</div>
          </div>
        </div>
        {o.renouvelable && !dim && (
          <span className="badge badge-green" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <RefreshCw size={10} /> Renouvelable
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Fréquence</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{o.frequence}</div>
        </div>
        <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Début</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            {format(new Date(o.date_debut), "d MMM yyyy", { locale: fr })}
          </div>
        </div>
        {o.date_fin && (
          <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Fin</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              {format(new Date(o.date_fin), "d MMM yyyy", { locale: fr })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Mes ordonnances" subtitle="Vos prescriptions médicales" />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : ordonnances.length === 0 ? (
        <div className="card">
          <EmptyState {...({ icon: <FileText size={40} />, message: "Aucune ordonnance enregistrée" } as any)} />
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>Traitements en cours ({active.length})</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {active.map(o => <OrdonnanceCard key={o.id} o={o} />)}
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Terminées ({expired.length})</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {expired.map(o => <OrdonnanceCard key={o.id} o={o} dim />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}