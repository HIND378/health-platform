from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID

from dependencies import get_current_user
from schemas.dossier_medical import DossierCreate
from schemas.ordonnance import OrdonnanceCreate, OrdonnanceUpdate
from services.crud_ordonnance import create_ordonnance, get_ordonnances, update_ordonnance

router = APIRouter()

# 👨‍⚕️ CREATE
@router.post("/")
def create(
    data: OrdonnanceCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return create_ordonnance(db, data, user)


# 👥 GET
@router.get("/")
def get_all(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_ordonnances(db, user)


# ✏️ UPDATE
@router.put("/{ordonnance_id}")
def update(
    ordonnance_id: UUID,
    data: OrdonnanceUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_ordonnance(db, ordonnance_id, data, user)