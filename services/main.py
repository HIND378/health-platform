from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import des routes (tu vas les créer)
from api import auth, rendez_vous, dossier_medical, resultat_analyse, ordonnance, get_user, statistique,predict, symptoms, summary


app = FastAPI(
    title="Medical Platform API",
    description="API pour la gestion des patients, médecins et rendez-vous",
    version="1.0.0"
)

# Configuration CORS (important pour frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inclusion des routes
app.include_router(auth.router, prefix="/auth", tags=["Authentification"])
app.include_router(rendez_vous.router, prefix="/rendez-vous", tags=["Rendez-vous"])
app.include_router(dossier_medical.router, prefix="/dossiers", tags=["Dossiers"])
app.include_router(resultat_analyse.router, prefix="/analyses", tags=["Analyses"])
app.include_router(ordonnance.router, prefix="/ordonnances", tags=["Ordonnances"])
app.include_router(get_user.router, prefix="/users", tags=["Utilisateurs"])
app.include_router(statistique.router, prefix="/stats", tags=["Statistiques"])
app.include_router(predict.router, prefix="/predict", tags=["Prédiction ML"])
app.include_router(symptoms.router, prefix="/symptoms", tags=["Symptômes"])
app.include_router(summary.router, prefix="/summary", tags=["Résumé IA"])

from services.email_service import (
    send_appointment_reminder,
    send_medication_reminder
)
from pydantic import BaseModel

class AppointmentReminderRequest(BaseModel):
    to_email: str
    patient_name: str
    doctor_name: str
    rdv_time: str

class MedicationReminderRequest(BaseModel):
    to_email: str
    patient_name: str
    medication: str
    dosage: str

@app.post("/notification/rendez-vous", tags=["Notifications"])
async def notify_appointment(req: AppointmentReminderRequest):
    result = send_appointment_reminder(
        req.to_email, req.patient_name,
        req.doctor_name, req.rdv_time
    )
    return result

@app.post("/notification/medication", tags=["Notifications"])
async def notify_medication(req: MedicationReminderRequest):
    result = send_medication_reminder(
        req.to_email, req.patient_name,
        req.medication, req.dosage
    )
    return result

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ia-service", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Health IA Service actif", "docs": "/docs"}