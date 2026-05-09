import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthIA — Plateforme Médicale",
  description: "Plateforme de gestion médicale intelligente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}