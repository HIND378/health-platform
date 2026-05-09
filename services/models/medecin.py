from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid

from database import Base

class Medecin(Base):
    __tablename__ = "medecins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String)
    prenom = Column(String)
    specialite = Column(String)
    num_rpps = Column(String)
    email = Column(String)
    disponible = Column(Boolean)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users_auth.id"))

    user = relationship("UserAuth", back_populates="medecin")
    rendez_vous = relationship("RendezVous", back_populates="medecin")
    dossiers = relationship("DossierMedical", back_populates="medecin")
    resultats = relationship("ResultatAnalyse", back_populates="medecin")
