from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import os
import httpx
import uvicorn
from pydantic import BaseModel

# Import des routes
from api import (auth, rendez_vous, dossier_medical,
                 resultat_analyse, ordonnance, get_user,
                 statistique, predict, symptoms, summary)
from services.email_service import (
    send_appointment_reminder,
    send_medication_reminder
)

app = FastAPI(
    title="Medical Platform API",
    description="API pour la gestion des patients, médecins et rendez-vous",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Config Keycloak définie ICI en premier
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
REALM = os.getenv("KEYCLOAK_REALM", "health-platform")
JWKS_URL = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token"
)

# ✅ get_current_user défini AVANT d'être utilisé
async def get_current_user(token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Session Keycloak invalide ou expirée"
        )
    return response.json()

# Routes
app.include_router(auth.router,             prefix="/auth",        tags=["Authentification"])
app.include_router(rendez_vous.router,      prefix="/rendez-vous", tags=["Rendez-vous"])
app.include_router(dossier_medical.router,  prefix="/dossiers",    tags=["Dossiers"])
app.include_router(resultat_analyse.router, prefix="/analyses",    tags=["Analyses"])
app.include_router(ordonnance.router,       prefix="/ordonnances", tags=["Ordonnances"])
app.include_router(get_user.router,         prefix="/users",       tags=["Utilisateurs"])
app.include_router(statistique.router,      prefix="/stats",       tags=["Statistiques"])
app.include_router(predict.router,          prefix="/predict",     tags=["Prédiction ML"])
app.include_router(symptoms.router,         prefix="/symptoms",    tags=["Symptômes"])
app.include_router(summary.router,          prefix="/summary",     tags=["Résumé IA"])

# Modèles notifications
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

# Routes notifications
@app.post("/notification/rendez-vous", tags=["Notifications"])
async def notify_appointment(req: AppointmentReminderRequest):
    return send_appointment_reminder(
        req.to_email, req.patient_name,
        req.doctor_name, req.rdv_time
    )

@app.post("/notification/medication", tags=["Notifications"])
async def notify_medication(req: MedicationReminderRequest):
    return send_medication_reminder(
        req.to_email, req.patient_name,
        req.medication, req.dosage
    )

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ia-service", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Health IA Service actif", "docs": "/docs"}

if __name__ == "__main__":
    # On récupère le port donné par Railway, sinon 8000 par défaut
    port = int(os.environ.get("PORT", 8000))
    # On force l'host à 0.0.0.0 pour être visible sur le web
    uvicorn.run(app, host="0.0.0.0", port=port)