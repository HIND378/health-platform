from fastapi import APIRouter,  Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db  # your DB session dependency
from models.patient import Patient
from models.medecin import Medecin
from models.rendez_vous import RendezVous

router = APIRouter()

@router.get("/")
def get_stats(db: Session = Depends(get_db)):
    # Count patients
    total_patients = db.query(Patient).count()
    
    # Count doctors (medecins)
    total_medecins = db.query(Medecin).count()
    
    # Count rendez-vous per status
    status_counts = db.query(
        RendezVous.statut, 
        func.count(RendezVous.id)
    ).group_by(RendezVous.statut).all()
    
    # Convert to dict: {"pending": 5, "confirmed": 10, ...}
    rendez_vous_states = {status: count for status, count in status_counts}
    
    return {
        "total_patients": total_patients,
        "total_medecins": total_medecins,
        "rendez_vous_states": rendez_vous_states
    }