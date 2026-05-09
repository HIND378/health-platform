"use client";
import { useEffect, useState } from "react";
import { statsApi, usersApi, rdvApi } from "@/lib/api-client";
import { Stats, Patient, Medecin, RendezVous } from "@/lib/types";
import { Users, Stethoscope, Calendar, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "JetBrains Mono, monospace" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsApi.get().catch(() => null),
      usersApi.getPatients().catch(() => []),
      usersApi.getMedecins().catch(() => []),
      rdvApi.getAll().catch(() => []),
    ]).then(([s, p, m, r]) => {
      setStats(s as Stats);
      setPatients(p as Patient[]);
      setMedecins(m as Medecin[]);
      setRdvs(r as RendezVous[]);
      setLoading(false);
    });
  }, []);

  const rdvStatusColors: Record<string, string> = {
    "en_attente": "var(--warning)",
    "accepté": "var(--success)",
    "refusé": "var(--danger)",
    "annulé": "var(--text-muted)",
  };

  const totalRdvs = Object.values(stats?.rendez_vous_states || {}).reduce((a, b) => a + b, 0);

  const topStats = [
    { label: "Total patients", value: stats?.total_patients ?? patients.length, icon: Users, color: "#3b9eff", href: "/dashboard/admin/patients" },
    { label: "Total médecins", value: stats?.total_medecins ?? medecins.length, icon: Stethoscope, color: "#00d4aa", href: "/dashboard/admin/medecins" },
    { label: "Total rendez-vous", value: totalRdvs, icon: Calendar, color: "var(--warning)", href: "/dashboard/admin/rendez-vous" },
    { label: "RDV acceptés", value: stats?.rendez_vous_states?.["accepté"] ?? 0, icon: CheckCircle, color: "var(--success)", href: "/dashboard/admin/rendez-vous" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Vue d'ensemble</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })} · Tableau de bord administrateur
        </p>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {topStats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 34, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                    {loading ? "—" : value}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 6 }}>{label}</div>
                </div>
                <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* RDV status chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingUp size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Rendez-vous par statut</h2>
          </div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="spinner" /></div>
          ) : (
            <div>
              {Object.entries(stats?.rendez_vous_states || {}).map(([status, count]) => (
                <MiniBar key={status} label={status} value={count} max={totalRdvs} color={rdvStatusColors[status] || "var(--accent)"} />
              ))}
              {totalRdvs === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucun rendez-vous</p>}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Accès rapide</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Gérer les patients", sub: `${patients.length} inscrits`, href: "/dashboard/admin/patients", color: "#3b9eff", icon: Users },
              { label: "Gérer les médecins", sub: `${medecins.length} actifs`, href: "/dashboard/admin/medecins", color: "#00d4aa", icon: Stethoscope },
              { label: "Tous les rendez-vous", sub: `${totalRdvs} total`, href: "/dashboard/admin/rendez-vous", color: "var(--warning)", icon: Calendar },
              { label: "Statistiques détaillées", sub: "Graphiques & métriques", href: "/dashboard/admin/statistiques", color: "var(--accent)", icon: TrendingUp },
            ].map(({ label, sub, href, color, icon: Icon }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: `${color}15`, borderRadius: 8, padding: 8 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent RDVs */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} color="var(--text-muted)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Derniers rendez-vous</h2>
          </div>
          <Link href="/dashboard/admin/rendez-vous" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Motif</th>
                <th>Durée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.slice(0, 8).map(rdv => (
                <tr key={rdv.id}>
                  <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {format(new Date(rdv.date_heure), "d MMM yyyy HH:mm", { locale: fr })}
                  </td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rdv.motif}</td>
                  <td>{rdv.duree_min} min</td>
                  <td><StatusBadge status={rdv.statut} /></td>
                </tr>
              ))}
              {rdvs.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Aucun rendez-vous</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}