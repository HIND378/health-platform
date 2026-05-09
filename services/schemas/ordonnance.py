from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class OrdonnanceBase(BaseModel):
    medicament: str


class OrdonnanceCreate(OrdonnanceBase):
    dossier_id: UUID
    patient_id: UUID
    dosage: str
    frequence: str
    date_debut: date
    date_fin: date
    renouvelable: bool
    


class OrdonnanceUpdate(BaseModel):
    medicament: Optional[str]
    dosage: Optional[str]
    frequence: Optional[str]
    date_debut: Optional[date]
    date_fin: Optional[date]
    renouvelable: Optional[bool]

class Ordonnance(OrdonnanceBase):
    id: UUID

    class Config:
        from_attributes = True