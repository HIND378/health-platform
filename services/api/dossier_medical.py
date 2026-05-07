from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID

from dependencies import get_current_user
from schemas.dossier_medical import DossierCreate, DossierUpdate
from services.crud_dossier_medical import create_dossier ,get_dossiers, update_dossier

router = APIRouter()

# 👨‍⚕️ CREATE
@router.post("/")
def create(
    data: DossierCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return create_dossier(db, data, user)


# 👥 GET
@router.get("/")
def get_all(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_dossiers(db, user)


# ✏️ UPDATE
@router.put("/{dossier_id}")
def update(
    dossier_id: UUID,
    data: DossierUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_dossier(db, dossier_id, data, user)