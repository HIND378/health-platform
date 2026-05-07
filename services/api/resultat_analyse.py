from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID

from dependencies import get_current_user

from schemas.resultat_analyse import ResultatAnalyseCreate, ResultatAnalyseUpdate
from services.crud_dossier_medical import create_dossier, get_dossiers
from services.crud_resultat_analyse import create_resultat, get_resultats, update_resultat

router = APIRouter()

# 👨‍⚕️ CREATE
@router.post("/")
def create(
    data: ResultatAnalyseCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return create_resultat(db, data, user)


# 👥 GET
@router.get("/")
def get_all(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_resultats(db, user)


# ✏️ UPDATE
@router.put("/{analyse_id}")
def update(
    analyse_id: UUID,
    data: ResultatAnalyseUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_resultat(db, analyse_id, data, user)