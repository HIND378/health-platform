from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID
from models.rendez_vous import RendezVous
from models.medecin import Medecin
from models.patient import Patient
from dependencies import get_current_user
from fastapi import HTTPException
from models.user_auth import UserAuth


router = APIRouter()

@router.get("/patients")
def get_patients(db: Session = Depends(get_db),
                 user=Depends(get_current_user)):
    user_id = user["sub"]  # UUID string

    # 👑 Superadmin
    if user["role"] == "superadmin":
        return db.query(Patient).all()

    # 👨‍⚕️ Médecin
    if user["role"] == "medecin":
        # Fetch the Medecin record linked to this user_id
        medecin = db.query(Medecin).filter(Medecin.user_id == user_id).first()
        
        if not medecin:
            raise HTTPException(404, "Doctor profile not found")
        
        print(f"Doctor ID: {medecin.id}")
        
        return db.query(Patient).join(
            RendezVous, Patient.id == RendezVous.patient_id
        ).filter(
            RendezVous.medecin_id == medecin.id,
            RendezVous.statut == "accepté"
        ).distinct().all()

    # 👤 Patient
    if user["role"] == "patient":
        # Find the Patient record linked to this user_id
        patient = db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient:
            raise HTTPException(404, "Patient profile not found")
        # Return only that patient's data (or a list with one item)
        return [patient]   # or return patient directly if API expects a single object

    raise HTTPException(403, "Unauthorized")


@router.get("/medecins")
def get_medecins(db: Session = Depends(get_db),
                 user=Depends(get_current_user)):
    user_id = user["sub"]  
    # 👑 Superadmin OR 👤 Patient
    if user["role"] in ["superadmin", "patient"]:
        return db.query(Medecin).all()

    # 👨‍⚕️ Médecin (optional: can see all or only himself)
    if user["role"] == "medecin":
        medecin = db.query(Medecin).filter(Medecin.user_id == user_id).first()
        if not medecin:
            raise HTTPException(404, "Doctor profile not found")
        return [medecin]   # return as a list for consistent response format

    raise HTTPException(403, "Unauthorized")
