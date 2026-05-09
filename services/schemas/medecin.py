from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class MedecinBase(BaseModel):
    nom: str
    prenom: str
    specialite: str


class MedecinCreate(MedecinBase):
    pass


class Medecin(MedecinBase):
    id: UUID

    class Config:
        from_attributes = True

