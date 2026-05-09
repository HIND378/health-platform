const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string) =>
    request<{ access_token: string; token_type: string }>(`/auth/login?email=${encodeURIComponent(email)}`, { method: "POST" }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getPatients: () => request<unknown[]>("/users/patients"),
  getMedecins: () => request<unknown[]>("/users/medecins"),
};

// ─── RENDEZ-VOUS ─────────────────────────────────────────────────────────────
export const rdvApi = {
  getAll: () => request<unknown[]>("/rendez-vous/"),
  create: (data: { medecin_id: string; date_heure: string; duree_min: number; motif: string }) =>
    request("/rendez-vous/", { method: "POST", body: JSON.stringify(data) }),
  cancel: (id: string) =>
    request(`/rendez-vous/${id}/`, { method: "PUT" }),
  update: (id: string, data: { date_heure?: string; duree_min?: number; statut?: string }) =>
    request(`/rendez-vous/les-rendez-vous/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── DOSSIERS ────────────────────────────────────────────────────────────────
export const dossiersApi = {
  getAll: () => request<unknown[]>("/dossiers/"),
  create: (data: { patient_id: string; diagnostic: string; antecedents?: string; icd10_code?: string; date_consultation: string }) =>
    request("/dossiers/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { diagnostic?: string; antecedents?: string; icd10_code?: string; date_consultation?: string }) =>
    request(`/dossiers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── ORDONNANCES ─────────────────────────────────────────────────────────────
export const ordonnancesApi = {
  getAll: () => request<unknown[]>("/ordonnances/"),
  create: (data: { patient_id: string; dossier_id?: string; medicament: string; dosage: string; frequence: string; date_debut: string; date_fin?: string; renouvelable: boolean }) =>
    request("/ordonnances/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { medicament?: string; dosage?: string; frequence?: string; date_debut?: string; date_fin?: string; renouvelable?: boolean }) =>
    request(`/ordonnances/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── ANALYSES ────────────────────────────────────────────────────────────────
export const analysesApi = {
  getAll: () => request<unknown[]>("/analyses/"),
  create: (data: { patient_id: string; type_analyse: string; valeurs: Record<string, unknown>; statut: string; date_resultat: string }) =>
    request("/analyses/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { type_analyse?: string; valeurs?: Record<string, unknown>; statut?: string; date_resultat?: string }) =>
    request(`/analyses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── STATS ───────────────────────────────────────────────────────────────────
export const statsApi = {
  get: () => request<{ total_patients: number; total_medecins: number; rendez_vous_states: Record<string, number> }>("/stats/"),
};

// ─── PREDICT ─────────────────────────────────────────────────────────────────
export const predictApi = {
  diabetes: (data: {
    pregnancies: number; glucose: number; blood_pressure: number;
    skin_thickness: number; insulin: number; bmi: number;
    diabetes_pedigree: number; age: number;
  }) => request("/predict/diabetes", { method: "POST", body: JSON.stringify(data) }),
  cardio: (data: {
    age: number; sex: number; cp: number; trestbps: number; chol: number;
    fbs: number; restecg: number; thalach: number; exang: number;
    oldpeak: number; slope: number; ca: number; thal: number;
  }) => request("/predict/cardio", { method: "POST", body: JSON.stringify(data) }),
};

// ─── SYMPTOMS ────────────────────────────────────────────────────────────────
export const symptomsApi = {
  analyze: (symptoms: string[], age: number) =>
    request("/symptoms/analyze", { method: "POST", body: JSON.stringify({ symptoms, age }) }),
};

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
export const summaryApi = {
  patient: (data: {
    patient_name: string; age: number; medical_history?: string[];
    medications?: string[]; recent_results?: Record<string, unknown>; symptoms?: string[];
  }) => request("/summary/patient", { method: "POST", body: JSON.stringify(data) }),
  chat: (question: string, history: { role: string; content: string }[]) =>
    request<{ response: string }>("/summary/chat/medical", {
      method: "POST",
      body: JSON.stringify({ question, history }),
    }),
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationsApi = {
  sendRdvReminder: (data: { to_email: string; patient_name: string; doctor_name: string; rdv_time: string }) =>
    request("/notification/rendez-vous", { method: "POST", body: JSON.stringify(data) }),
  sendMedReminder: (data: { to_email: string; patient_name: string; medication: string; dosage: string }) =>
    request("/notification/medication", { method: "POST", body: JSON.stringify(data) }),
};