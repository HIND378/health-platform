from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid

from database import Base
class RendezVous(Base):
    __tablename__ = "rendez_vous"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    date_heure = Column(TIMESTAMP)
    duree_min = Column(Integer)
    statut = Column(String)
    motif = Column(String)
    notes = Column(String)

    patient = relationship("Patient", back_populates="rendez_vous")
    medecin = relationship("Medecin", back_populates="rendez_vous")