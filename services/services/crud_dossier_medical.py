from models.patient import Patient
from models.medecin import Medecin
from models.dossier_medical import DossierMedical
from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID

def create_dossier(db: Session, data, user):

    if user["role"] != "medecin":
        raise HTTPException(403, "Accès refusé")

    # 🔹 get medecin
    medecin = db.query(Medecin).filter(
        Medecin.user_id == user["sub"]
    ).first()

    if not medecin:
        raise HTTPException(404, "Médecin introuvable")

    # 🔹 verify patient exists
    patient = db.query(Patient).filter(
        Patient.id == data.patient_id
    ).first()

    if not patient:
        raise HTTPException(404, "Patient introuvable")

    dossier = DossierMedical(
        patient_id=patient.id,
        medecin_id=medecin.id,   # 🔥 auto set
        diagnostic=data.diagnostic,
        antecedents=data.antecedents,
        icd10_code=data.icd10_code,
        date_consultation=data.date_consultation
    )

    db.add(dossier)
    db.commit()
    db.refresh(dossier)

    return dossier

def get_dossiers(db: Session, user):

    role = user["role"]
    user_id = user["sub"]

    if role == "patient":

        patient = db.query(Patient).filter(
            Patient.user_id == user_id
        ).first()

        if not patient:
            raise HTTPException(404, "Patient introuvable")

        return db.query(DossierMedical).filter(
            DossierMedical.patient_id == patient.id
        ).all()

    elif role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        return db.query(DossierMedical).filter(
            DossierMedical.medecin_id == medecin.id
        ).all()

    elif role == "superadmin":
        return db.query(DossierMedical).all()

    else:
        raise HTTPException(403)
    
def update_dossier(db: Session, dossier_id: UUID, data, user):

    dossier = db.query(DossierMedical).filter(
        DossierMedical.id == dossier_id
    ).first()

    if not dossier:
        raise HTTPException(404, "Dossier introuvable")

    role = user["role"]
    user_id = user["sub"]

    if role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        if dossier.medecin_id != medecin.id:
            raise HTTPException(403, "Accès refusé")

    elif role != "superadmin":
        raise HTTPException(403)

    # 🔹 Update fields
    if data.diagnostic is not None:
        dossier.diagnostic = data.diagnostic

    if data.antecedents is not None:
        dossier.antecedents = data.antecedents

    if data.icd10_code is not None:
        dossier.icd10_code = data.icd10_code

    if data.date_consultation is not None:
        dossier.date_consultation = data.date_consultation

    db.commit()
    db.refresh(dossier)

    return dossier    