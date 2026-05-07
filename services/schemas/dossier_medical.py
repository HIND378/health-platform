from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class DossierBase(BaseModel):
    diagnostic: Optional[str]


class DossierCreate(DossierBase):
    patient_id: UUID
    diagnostic: str
    antecedents: str
    icd10_code: str
    date_consultation: datetime
  

class DossierUpdate(BaseModel):
    diagnostic: Optional[str] = None
    antecedents: Optional[str] = None
    icd10_code: Optional[str] = None
    date_consultation: Optional[datetime] = None

class Dossier(DossierBase):
    id: UUID

    class Config:
        from_attributes = True

