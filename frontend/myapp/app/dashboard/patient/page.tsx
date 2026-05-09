"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { rdvApi, dossiersApi, ordonnancesApi } from "@/lib/api-client";
import { RendezVous, DossierMedical, Ordonnance } from "@/lib/types";
import { Calendar, FolderOpen, FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rdvApi.getAll().catch(() => []),
      dossiersApi.getAll().catch(() => []),
      ordonnancesApi.getAll().catch(() => []),
    ]).then(([r, d, o]) => {
      setRdvs(r as RendezVous[]);
      setDossiers(d as DossierMedical[]);
      setOrdonnances(o as Ordonnance[]);
      setLoading(false);
    });
  }, []);

  const upcomingRdvs = rdvs.filter(r => r.statut === "accepté" || r.statut === "en_attente");
  const activeOrdonnances = ordonnances.filter(o => !o.date_fin || new Date(o.date_fin) >= new Date());

  const stats = [
    { label: "Rendez-vous", value: upcomingRdvs.length, icon: Calendar, color: "var(--accent)", href: "/dashboard/patient/rendez-vous" },
    { label: "Dossiers médicaux", value: dossiers.length, icon: FolderOpen, color: "var(--accent-2)", href: "/dashboard/patient/dossier" },
    { label: "Ordonnances actives", value: activeOrdonnances.length, icon: FileText, color: "var(--warning)", href: "/dashboard/patient/ordonnances" },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Bonjour 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
          {user?.email} · Voici votre tableau de bord santé
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                    {loading ? "—" : value}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 6 }}>{label}</div>
                </div>
                <div style={{ background: `${color}15`, borderRadius: 10, padding: 10 }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Next appointments */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Prochains rendez-vous</h2>
          <Link href="/dashboard/patient/rendez-vous" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <div className="spinner" />
          </div>
        ) : upcomingRdvs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            Aucun rendez-vous à venir
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingRdvs.slice(0, 4).map((rdv) => (
              <div key={rdv.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "rgba(59,158,255,0.1)", borderRadius: 8, padding: "8px", display: "flex" }}>
                    <Clock size={16} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {format(new Date(rdv.date_heure), "EEEE d MMMM yyyy", { locale: fr })}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>
                      {format(new Date(rdv.date_heure), "HH:mm")} · {rdv.duree_min} min · {rdv.motif}
                    </div>
                  </div>
                </div>
                <StatusBadge status={rdv.statut} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest ordonnances */}
      {!loading && activeOrdonnances.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Ordonnances en cours</h2>
            <Link href="/dashboard/patient/ordonnances" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {activeOrdonnances.slice(0, 4).map(o => (
              <div key={o.id} style={{
                padding: "14px 16px",
                background: "rgba(255,169,77,0.05)",
                border: "1px solid rgba(255,169,77,0.15)",
                borderRadius: 12
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--warning)" }}>{o.medicament}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>{o.dosage} · {o.frequence}</div>
                {o.renouvelable && (
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-green" style={{ fontSize: 10 }}>Renouvelable</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}