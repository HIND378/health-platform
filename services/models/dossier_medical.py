from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from models.ordonnance import Ordonnance

from database import Base

class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    diagnostic = Column(Text)
    antecedents = Column(Text)
    icd10_code = Column(String)
    date_consultation = Column(TIMESTAMP)

    patient = relationship("Patient", back_populates="dossiers")
    medecin = relationship("Medecin", back_populates="dossiers")
    ordonnances = relationship("Ordonnance", back_populates="dossier")
    resultats = relationship("ResultatAnalyse", back_populates="dossier")
