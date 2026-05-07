from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid

from database import Base
class Ordonnance(Base):
    __tablename__ = "ordonnances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers_medicaux.id"))
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    medicament = Column(String)
    dosage = Column(String)
    frequence = Column(String)
    date_debut = Column(Date)
    date_fin = Column(Date)
    renouvelable = Column(Boolean)

    dossier = relationship("DossierMedical", back_populates="ordonnances")