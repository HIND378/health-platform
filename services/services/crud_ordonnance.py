from models.patient import Patient
from models.medecin import Medecin
from models.ordonnance import Ordonnance
from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID

def create_ordonnance(db: Session, data, user):

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

    ordonnance = Ordonnance(
        patient_id=patient.id,
        medecin_id=medecin.id,   # 🔥 auto set
        dossier_id=data.dossier_id,
        medicament=data.medicament,
        dosage=data.dosage,
        frequence=data.frequence,
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        renouvelable=data.renouvelable
    )

    db.add(ordonnance)
    db.commit()
    db.refresh(ordonnance)

    return ordonnance

def get_ordonnances(db: Session, user):

    role = user["role"]
    user_id = user["sub"]

    if role == "patient":

        patient = db.query(Patient).filter(
            Patient.user_id == user_id
        ).first()

        if not patient:
            raise HTTPException(404, "Patient introuvable")

        return db.query(Ordonnance).filter(
            Ordonnance.patient_id == patient.id
        ).all()

    elif role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        return db.query(Ordonnance).filter(
            Ordonnance.medecin_id == medecin.id
        ).all()

    elif role == "superadmin":
        return db.query(Ordonnance).all()

    else:
        raise HTTPException(403)

def update_ordonnance(db: Session, ordonnance_id: UUID, data, user):

    ordonnance = db.query(Ordonnance).filter(
        Ordonnance.id == ordonnance_id
    ).first()

    if not ordonnance:
        raise HTTPException(404, "Ordonnance introuvable")

    role = user["role"]
    user_id = user["sub"]

    if role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        if ordonnance.medecin_id != medecin.id:
            raise HTTPException(403, "Accès refusé")

    elif role != "superadmin":
        raise HTTPException(403)

    # 🔹 Update fields
    if data.medicament is not None:
        ordonnance.medicament = data.medicament

    if data.dosage is not None:
        ordonnance.dosage = data.dosage

    if data.frequence is not None:
        ordonnance.frequence = data.frequence

    if data.date_debut is not None:
        ordonnance.date_debut = data.date_debut

    if data.date_fin is not None:
        ordonnance.date_fin = data.date_fin

    if data.renouvelable is not None:
        ordonnance.renouvelable = data.renouvelable

   
    db.commit()
    db.refresh(ordonnance)

    return ordonnance    