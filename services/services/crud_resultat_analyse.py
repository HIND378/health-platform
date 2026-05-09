from models.patient import Patient
from models.medecin import Medecin
from models.resultat_analyse import ResultatAnalyse
from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID

def create_resultat(db: Session, data, user):

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

    resultat = ResultatAnalyse(
        patient_id=patient.id,
        medecin_id=medecin.id,   # 🔥 auto set
        type_analyse=data.type_analyse,
        valeurs=data.valeurs,
        statut=data.statut,
        date_resultat=data.date_resultat
    )

    db.add(resultat)
    db.commit()
    db.refresh(resultat)

    return resultat

def get_resultats(db: Session, user):

    role = user["role"]
    user_id = user["sub"]

    if role == "patient":

        patient = db.query(Patient).filter(
            Patient.user_id == user_id
        ).first()

        if not patient:
            raise HTTPException(404, "Patient introuvable")

        return db.query(ResultatAnalyse).filter(
            ResultatAnalyse.patient_id == patient.id
        ).all()

    elif role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        return db.query(ResultatAnalyse).filter(
            ResultatAnalyse.medecin_id == medecin.id
        ).all()

    elif role == "superadmin":
        return db.query(ResultatAnalyse).all()

    else:
        raise HTTPException(403)
    
def update_resultat(db: Session, analyse_id: UUID, data, user):

    resultat = db.query(ResultatAnalyse).filter(
        ResultatAnalyse.id == analyse_id
    ).first()

    if not resultat:
        raise HTTPException(404, "Résultat d'analyse introuvable")

    role = user["role"]
    user_id = user["sub"]

    if role == "medecin":

        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        if resultat.medecin_id != medecin.id:
            raise HTTPException(403, "Accès refusé")

    elif role != "superadmin":
        raise HTTPException(403)

    # 🔹 Update fields
    if data.type_analyse is not None:
        resultat.type_analyse = data.type_analyse

    if data.valeurs is not None:
        resultat.valeurs = data.valeurs

    if data.statut is not None:
        resultat.statut = data.statut

    if data.date_resultat is not None:
        resultat.date_resultat = data.date_resultat

  

    db.commit()
    db.refresh(resultat)

    return resultat    