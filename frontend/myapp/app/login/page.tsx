"use client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Heart, Mail, ArrowRight, Shield } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await login(email);
    } catch (err: unknown) {
      setError((err as Error).message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,158,255,0.06) 0%, transparent 70%)",
        top: -200, right: -200,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)",
        bottom: -100, left: -100,
        pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #3b9eff, #00d4aa)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(59,158,255,0.3)"
          }}>
            <Heart size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            HealthIA
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
            Plateforme médicale intelligente
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
            Connexion
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
            Entrez votre adresse e-mail pour accéder à votre espace
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Adresse e-mail</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--text-muted)"
                }} />
                <input
                  type="email"
                  className="field-input"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(255,87,87,0.08)",
                border: "1px solid rgba(255,87,87,0.2)",
                borderRadius: 8, padding: "10px 14px",
                marginBottom: 16, fontSize: 13,
                color: "var(--danger)"
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <>
                Connexion <ArrowRight size={16} />
              </>}
            </button>
          </form>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginTop: 20, padding: "12px 14px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 10
          }}>
            <Shield size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Connexion sécurisée — Données médicales protégées
            </span>
          </div>
        </div>

        {/* Demo hints */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Accès selon votre rôle: patient, médecin ou administrateur
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}