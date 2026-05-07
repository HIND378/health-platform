from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class RendezVousBase(BaseModel):
    date_heure: datetime
    duree_min: int
    statut: str


class RendezVousCreate(RendezVousBase):
    medecin_id: UUID
    motif: str
    date_heure: datetime
    duree_min: int = 30 


class RendezVousUpdate(BaseModel):
    date_heure: Optional[datetime]
    statut: Optional[str]    
    duree_min: Optional[int] = None


class RendezVous(RendezVousBase):
    id: UUID

    class Config:
        from_attributes = True
