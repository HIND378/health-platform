from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid


from database import Base
class ResultatAnalyse(Base):
    __tablename__ = "resultats_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers_medicaux.id"))
    type_analyse = Column(String)
    valeurs = Column(JSON)
    statut = Column(String)
    date_resultat = Column(TIMESTAMP)

    patient = relationship("Patient", back_populates="analyses")
    medecin = relationship("Medecin", back_populates="resultats")
    dossier = relationship("DossierMedical", back_populates="resultats")