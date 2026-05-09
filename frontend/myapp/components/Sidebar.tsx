"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard, Calendar, FolderOpen, FileText,
  FlaskConical, Brain, Users, BarChart3, Bot, LogOut,
  Stethoscope, Activity, Heart
} from "lucide-react";

const patientNav = [
  { href: "/dashboard/patient", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/patient/rendez-vous", icon: Calendar, label: "Rendez-vous" },
  { href: "/dashboard/patient/dossier", icon: FolderOpen, label: "Mon dossier" },
  { href: "/dashboard/patient/ordonnances", icon: FileText, label: "Ordonnances" },
  { href: "/dashboard/patient/analyses", icon: FlaskConical, label: "Analyses" },
  { href: "/dashboard/patient/predict", icon: Brain, label: "Prédiction IA" },
  { href: "/dashboard/patient/symptoms", icon: Activity, label: "Symptômes" },
];

const medecinNav = [
  { href: "/dashboard/medecin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/medecin/rendez-vous", icon: Calendar, label: "Rendez-vous" },
  { href: "/dashboard/medecin/patients", icon: Users, label: "Mes patients" },
  { href: "/dashboard/medecin/dossiers", icon: FolderOpen, label: "Dossiers médicaux" },
  { href: "/dashboard/medecin/ordonnances", icon: FileText, label: "Ordonnances" },
  { href: "/dashboard/medecin/analyses", icon: FlaskConical, label: "Analyses" },
  { href: "/dashboard/medecin/ia", icon: Bot, label: "Assistant IA" },
];

const adminNav = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/admin/patients", icon: Users, label: "Patients" },
  { href: "/dashboard/admin/medecins", icon: Stethoscope, label: "Médecins" },
  { href: "/dashboard/admin/rendez-vous", icon: Calendar, label: "Rendez-vous" },
  { href: "/dashboard/admin/statistiques", icon: BarChart3, label: "Statistiques" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const nav = user?.role === "patient" ? patientNav
    : user?.role === "medecin" ? medecinNav
    : adminNav;

  const roleLabel = user?.role === "patient" ? "Patient"
    : user?.role === "medecin" ? "Médecin"
    : "Administrateur";

  const roleColor = user?.role === "patient" ? "#3b9eff"
    : user?.role === "medecin" ? "#00d4aa"
    : "#ffa94d";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #3b9eff, #00d4aa)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Heart size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>HealthIA</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Plateforme médicale</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${roleColor}22`,
              border: `1px solid ${roleColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: roleColor
            }}>
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 11, color: roleColor, marginTop: 1 }}>{roleLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: "100%", background: "none", border: "none", color: "var(--danger)" }}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}