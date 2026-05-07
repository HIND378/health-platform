from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from models.rendez_vous import RendezVous
from models.medecin import Medecin
from models.patient import Patient


# -----------------------------
# 🔹 CREATE RDV (PATIENT)
# -----------------------------
def create_rendez_vous(db: Session, user_id: UUID, data):

    # 🔹 Convert user → patient
    patient = db.query(Patient).filter(
        Patient.user_id == user_id
    ).first()

    if not patient:
        raise HTTPException(404, "Patient introuvable")

    # 🔹 Verify medecin
    medecin = db.query(Medecin).filter(
        Medecin.id == data.medecin_id
    ).first()

    if not medecin:
        raise HTTPException(404, "Médecin non trouvé")

    # 🔹 Conflict check
    conflict = db.query(RendezVous).filter(
        RendezVous.medecin_id == data.medecin_id,
        RendezVous.date_heure == data.date_heure
    ).first()

    if conflict:
        raise HTTPException(400, "Créneau déjà réservé")

    # 🔥 AUTO INSERT patient_id
    rdv = RendezVous(
        patient_id=patient.id,   # ✅ automatic
        medecin_id=data.medecin_id,
        date_heure=data.date_heure,
        duree_min=data.duree_min,
        motif=data.motif,
        statut="en_attente"
    )

    db.add(rdv)
    db.commit()
    db.refresh(rdv)

    return rdv

# -----------------------------
# 🔹 GET RDV (ROLE BASED)
# -----------------------------
def get_rendez_vous(db: Session, user):

    role = user["role"]
    user_id = user["sub"]

    if role == "patient":
        patient = db.query(Patient).filter(
            Patient.user_id == user_id
        ).first()

        if not patient:
            raise HTTPException(404, "Patient introuvable")

        return db.query(RendezVous).filter(
            RendezVous.patient_id == patient.id
        ).all()

    elif role == "medecin":
        medecin = db.query(Medecin).filter(
            Medecin.user_id == user_id
        ).first()

        if not medecin:
            raise HTTPException(404, "Médecin introuvable")

        return db.query(RendezVous).filter(
            RendezVous.medecin_id == medecin.id
        ).all()

    elif role == "superadmin":
        return db.query(RendezVous).all()

    else:
        raise HTTPException(403, "Accès refusé")
# -----------------------------
# 🔹 CANCEL RDV (PATIENT ONLY)
# -----------------------------
def cancel_rendez_vous(db: Session, rdv_id: UUID, user_id: UUID):

    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()

    if not rdv:
        raise HTTPException(404, "RDV introuvable")

    if rdv.patient_id != patient.id:
        raise HTTPException(403, "Accès refusé")

    if rdv.statut in ["annulé", "refuse"]:
        raise HTTPException(400, "RDV déjà traité")

    rdv.statut = "annulé"

    db.commit()
    db.refresh(rdv)

    return rdv


# -----------------------------
# 🔹 UPDATE RDV (MEDECIN / SUPERADMIN)
# -----------------------------
def update_rendez_vous(db: Session, rdv_id: UUID, data, user):

    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()

    if not rdv:
        raise HTTPException(404, "RDV introuvable")

    role = user["role"]
    user_id = user["sub"]
    medecin = db.query(Medecin).filter(Medecin.user_id == user_id).first()
   

    # 🔐 AUTHORIZATION
    if role == "medecin":
        if rdv.medecin_id != medecin.id:
            raise HTTPException(403, "Accès refusé")

    elif role != "superadmin":
        raise HTTPException(403, "Accès refusé")

    # ❌ Prevent modifying cancelled
    if rdv.statut == "annule":
        raise HTTPException(400, "Impossible de modifier un RDV annulé")

    # -----------------------------
    # 🔹 Allowed updates
    # -----------------------------

    # ✅ Update date + duration
    if data.date_heure:
        rdv.date_heure = data.date_heure

    if data.duree_min:
        rdv.duree_min = data.duree_min

    # ✅ Update statut (STRICT CONTROL)
    if data.statut:

        allowed_status = ["accepté", "refusé"]

        if data.statut not in allowed_status:
            raise HTTPException(400, "Statut invalide")

        rdv.statut = data.statut

    db.commit()
    db.refresh(rdv)

    return rdv