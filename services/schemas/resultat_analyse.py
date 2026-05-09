from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from typing import Dict, Any

class ResultatAnalyseBase(BaseModel):
    type_analyse: str
    valeurs: Dict[str, Any]
    statut: str


class ResultatAnalyseCreate(ResultatAnalyseBase):
    patient_id: UUID
   
    dossier_id: UUID
    date_resultat: datetime

class ResultatAnalyseUpdate(BaseModel):
    type_analyse: Optional[str] = None
    valeurs: Optional[Dict[str, Any]] = None
    statut: Optional[str] = None
    date_resultat: Optional[datetime] = None

class ResultatAnalyse(ResultatAnalyseBase):
    id: UUID
    date_resultat: datetime

    class Config:
        from_attributes = True