from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class PatientBase(BaseModel):
    nom: str
    prenom: str
    email: str


class PatientCreate(PatientBase):
    pass


class Patient(PatientBase):
    id: UUID

    class Config:
        from_attributes = True

