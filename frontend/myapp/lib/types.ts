// lib/types.ts

export type GroupeSanguin =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type StatutRendezVous =
  | 'en_attente'
  | 'accepté'
  | 'refusé'
  | 'annulé';
export type StatutAnalyse = 'en_attente' | 'disponible' | 'anormal';
export type UserRole = 'superadmin' | 'medecin' | 'patient';

export interface DossierMedical {
  id: string; // uuid
  patient_id: string; // FK → Patient.id
  medecin_id: string; // FK → Medecin.id
  diagnostic?: string ;
  antecedents?: string ;
  icd10_code?: string | null; // Code CIM-10
  date_consultation: string; // ISO timestamp
}

export interface DossierCreate {
  patient_id: string;
  medecin_id: string;
  diagnostic: string;
  traitement: string;
}

export interface DossierUpdate {
  diagnostic?: string;
  traitement?: string;
}

export interface RendezVous {
 id: string; // uuid
  patient_id: string; // FK → Patient.id
  medecin_id: string; // FK → Medecin.id
  date_heure: string; // ISO timestamp
  duree_min: number; // integer
  statut: StatutRendezVous;
  motif?: string | null;
  notes?: string | null;
}

export interface RendezVousCreate {
  medecin_id: string;
  date_heure: string;
  duree_min: number;
  motif?: string;
}

export interface RendezVousUpdate {
  statut?: 'accepté' | 'refusé' | 'annulé';
  date_heure?: string;
    duree_min?: number;
  motif?: string;
}

export interface Patient {
  id: string; // uuid
  nom: string;
  prenom: string;
  date_naissance: string; // ISO date (YYYY-MM-DD)
  email: string;
  telephone?: string | null;
  numero_secu?: string | null;
  groupe_sanguin?: GroupeSanguin | null;
  allergies?: string | null;
  created_at: string; // ISO timestamp
}

export interface Medecin {
  id: string; // uuid
  nom: string;
  prenom: string;
  specialite?: string | null;
  num_rpps: string;
  email: string;
  disponible: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface Ordonnance {
  id: string; // uuid
  dossier_id: string; // FK → DossierMedical.id
  medicament: string;
  dosage: string;
  frequence: string; // e.g., "1x/jour", "toutes les 8h"
  date_debut: string; // ISO date
  date_fin?: string | null; // ISO date, null if ongoing
  renouvelable: boolean;
}
export interface Stats {
  total_patients: number;
  total_medecins: number;
  rendez_vous_states: Record<string, number>;
}
 
export interface DiabetesPrediction {
  prediction: 0 | 1;
  probability: number;
  risk_level: "low" | "medium" | "high";
}
 
export interface CardioPrediction {
  prediction: 0 | 1;
  probability: number;
  risk_level: "low" | "medium" | "high";
}
 
export interface SymptomResult {
  possible_conditions: {
    condition: string;
    matches: number;
    urgency: "urgent" | "normal";
  }[];
  disclaimer: string;
}
 
export interface PatientSummary {
  resume: string;
  points_attention: string[];
  examens_suggeres: string[];
  priorite: string;
}
export type Role = "patient" | "medecin" | "superadmin";
 
export interface User {
  sub: string;
  email: string;
  role: Role;
  nom?: string;
  prenom?: string;
} 
export interface ResultatAnalyse {
  id: string;
  patient_id: string;
  medecin_id: string;
  type_analyse: string;
  valeurs: Record<string, unknown>;
  statut: string;
  date_resultat: string;
}