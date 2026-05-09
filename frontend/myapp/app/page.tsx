"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { router.push("/login"); return; }
    if (user.role === "patient") router.push("/dashboard/patient");
    else if (user.role === "medecin") router.push("/dashboard/medecin");
    else router.push("/dashboard/admin");
  }, [router]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
}