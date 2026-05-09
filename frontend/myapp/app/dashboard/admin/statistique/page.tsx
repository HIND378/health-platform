"use client";
import { useEffect, useState } from "react";
import { statsApi, rdvApi, usersApi } from "@/lib/api-client";
import { Stats, RendezVous, Patient, Medecin } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { BarChart3, TrendingUp, Users, Stethoscope, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function DonutChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }} />;
  let cumAngle = -90;
  const cx = size / 2, cy = size / 2, r = size * 0.38, inner = size * 0.22;

  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, angle };
  });

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const s1 = toXY(s.startAngle, r);
        const e1 = toXY(s.startAngle + s.angle, r);
        const s2 = toXY(s.startAngle, inner);
        const e2 = toXY(s.startAngle + s.angle, inner);
        const large = s.angle > 180 ? 1 : 0;
        const d = `M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${inner} ${inner} 0 ${large} 0 ${s2.x} ${s2.y} Z`;
        return <path key={i} d={d} fill={s.color} opacity={0.9} />;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize={size * 0.14} fontWeight="700" fontFamily="JetBrains Mono, monospace">{total}</text>
      <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill="var(--text-muted)" fontSize={size * 0.08} fontFamily="Sora, sans-serif">total</text>
    </svg>
  );
}

function BarGroup({ data, height = 140 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height }}>
      {data.map(d => (
        <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: d.color, fontFamily: "JetBrains Mono, monospace" }}>{d.value}</span>
          <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 6, height: height - 30, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", background: `linear-gradient(to top, ${d.color}, ${d.color}88)`, borderRadius: 6, height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0, transition: "height 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, r, p, m] = await Promise.all([
      statsApi.get().catch(() => null),
      rdvApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
      usersApi.getMedecins().catch(() => []),
    ]);
    setStats(s as Stats);
    setRdvs(r as RendezVous[]);
    setPatients(p as Patient[]);
    setMedecins(m as Medecin[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rdvDonut = [
    { label: "En attente", value: stats?.rendez_vous_states?.["en_attente"] || 0, color: "var(--warning)" },
    { label: "Acceptés", value: stats?.rendez_vous_states?.["accepté"] || 0, color: "var(--success)" },
    { label: "Refusés", value: stats?.rendez_vous_states?.["refusé"] || 0, color: "var(--danger)" },
    { label: "Annulés", value: stats?.rendez_vous_states?.["annulé"] || 0, color: "var(--text-muted)" },
  ];

  // Monthly RDV counts (last 6 months)
  const monthlyData = (() => {
    const months: { label: string; value: number; color: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = format(d, "MMM", { locale: fr });
      const value = rdvs.filter(r => {
        const rd = new Date(r.date_heure);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, value, color: "var(--accent)" });
    }
    return months;
  })();

  // Specialty distribution
  const specialtyData = (() => {
    const counts: Record<string, number> = {};
    medecins.forEach((m: Medecin) => {
      const s = m.specialite || "Généraliste";
      counts[s] = (counts[s] || 0) + 1;
    });
    const colors = ["#3b9eff", "#00d4aa", "#ffa94d", "#ff5757", "#a855f7", "#51cf66"];
    return Object.entries(counts).slice(0, 6).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  })();

  return (
    <div>
      <PageHeader
        title="Statistiques"
        subtitle="Métriques et indicateurs de la plateforme"
        action={
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        }
      />

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Patients", value: stats?.total_patients ?? patients.length, icon: Users, color: "#3b9eff", sub: "enregistrés" },
          { label: "Médecins", value: stats?.total_medecins ?? medecins.length, icon: Stethoscope, color: "#00d4aa", sub: "actifs" },
          { label: "RDV total", value: rdvs.length, icon: Calendar, color: "var(--warning)", sub: "créés" },
          { label: "Taux acceptation", value: rdvs.length > 0 ? `${Math.round(((stats?.rendez_vous_states?.["accepté"] || 0) / rdvs.length) * 100)}%` : "—", icon: TrendingUp, color: "var(--success)", sub: "des RDV" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                  {loading ? "—" : value}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>{label}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{sub}</div>
              </div>
              <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Donut */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <BarChart3 size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Répartition des rendez-vous</h2>
          </div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="spinner" /></div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <DonutChart data={rdvDonut} size={160} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {rdvDonut.map(d => (
                  <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: d.color, fontFamily: "JetBrains Mono, monospace" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly bar */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <TrendingUp size={16} color="var(--accent-2)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>RDV par mois (6 mois)</h2>
          </div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="spinner" /></div>
          ) : (
            <BarGroup data={monthlyData} height={150} />
          )}
        </div>
      </div>

      {/* Specialty distribution */}
      {specialtyData.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <Stethoscope size={16} color="var(--warning)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Médecins par spécialité</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {specialtyData.map(s => (
              <div key={s.label} style={{ padding: "14px 16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}