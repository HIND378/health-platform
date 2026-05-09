"use client";
import { useEffect, useState } from "react";
import { rdvApi, usersApi } from "@/lib/api-client";
import { RendezVous, Patient } from "@/lib/types";
import { Calendar, Users, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedecinDashboard() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rdvApi.getAll().catch(() => []),
      usersApi.getPatients().catch(() => []),
    ]).then(([r, p]) => {
      setRdvs(r as RendezVous[]);
      setPatients(p as Patient[]);
      setLoading(false);
    });
  }, []);

  const pending = rdvs.filter(r => r.statut === "en_attente");
  const today = rdvs.filter(r => {
    const d = new Date(r.date_heure);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const stats = [
    { label: "Patients suivis", value: patients.length, icon: Users, color: "#00d4aa", href: "/dashboard/medecin/patients" },
    { label: "RDV en attente", value: pending.length, icon: Clock, color: "var(--warning)", href: "/dashboard/medecin/rendez-vous" },
    { label: "RDV aujourd'hui", value: today.length, icon: Calendar, color: "var(--accent)", href: "/dashboard/medecin/rendez-vous" },
    { label: "RDV acceptés", value: rdvs.filter(r => r.statut === "accepté").length, icon: CheckCircle, color: "var(--success)", href: "/dashboard/medecin/rendez-vous" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Tableau de bord</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                    {loading ? "—" : value}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 6 }}>{label}</div>
                </div>
                <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending RDVs */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={16} color="var(--warning)" />
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Rendez-vous en attente</h2>
            {!loading && pending.length > 0 && (
              <span className="badge badge-yellow">{pending.length}</span>
            )}
          </div>
          <Link href="/dashboard/medecin/rendez-vous" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
            Gérer <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 30 }}>
            <div className="spinner" />
          </div>
        ) : pending.length === 0 ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <CheckCircle size={28} color="var(--success)" style={{ margin: "0 auto 10px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Aucun RDV en attente — tout est à jour !</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.slice(0, 5).map(rdv => (
                <tr key={rdv.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {format(new Date(rdv.date_heure), "d MMM yyyy", { locale: fr })}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{format(new Date(rdv.date_heure), "HH:mm")}</div>
                  </td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rdv.motif}</td>
                  <td><StatusBadge status={rdv.statut} /></td>
                  <td>
                    <Link href="/dashboard/medecin/rendez-vous" className="btn btn-secondary btn-sm">
                      Traiter
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent patients */}
      {!loading && patients.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={16} color="var(--accent-2)" />
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Mes patients</h2>
            </div>
            <Link href="/dashboard/medecin/patients" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, padding: 20 }}>
            {patients.slice(0, 8).map((p: Patient) => (
              <div key={p.id} style={{ padding: "12px 14px", background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,212,170,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#00d4aa" }}>
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{p.prenom} {p.nom}</div>
                {p.groupe_sanguin && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Gr. {p.groupe_sanguin}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}