from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID

from schemas.rendez_vous import (
    RendezVousCreate,
    RendezVousUpdate  # 👈 NEW schema (important)
)

from services.crud_rendez_vous import (
    create_rendez_vous,
    get_rendez_vous,   # 👈 unified function
    cancel_rendez_vous,
    update_rendez_vous
)

from dependencies import require_role, get_current_user

router = APIRouter()


# ----------------------------------
# 👤 PATIENT - CREATE RDV
# ----------------------------------
@router.post("/")
def create(
    data: RendezVousCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("patient"))
):
    return create_rendez_vous(db, user["sub"], data)


# ----------------------------------
# 👥 ALL ROLES - GET RDV (SMART)
# ----------------------------------
@router.get("/")
def get_all(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_rendez_vous(db, user)


# ----------------------------------
# 👤 PATIENT - CANCEL RDV
# ----------------------------------
@router.put("/{rdv_id}/")
def cancel(
    rdv_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_role("patient"))
):
    return cancel_rendez_vous(db, rdv_id, user["sub"])


# ----------------------------------
# 👨‍⚕️ / 👨‍💼 UPDATE RDV
# ----------------------------------
@router.put("/les-rendez-vous/{rdv_id}")
def update(
    rdv_id: UUID,
    data: RendezVousUpdate,   # 👈 SAFE schema instead of dict
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_rendez_vous(db, rdv_id, data, user)