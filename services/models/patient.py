from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from models.resultat_analyse import ResultatAnalyse
from models.dossier_medical import DossierMedical

from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String)
    prenom = Column(String)
    date_naissance = Column(Date)
    email = Column(String)
    telephone = Column(String)
    numero_secu = Column(String)
    groupe_sanguin = Column(String)
    allergies = Column(Text)
    created_at = Column(TIMESTAMP)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users_auth.id"))

    user = relationship("UserAuth", back_populates="patient")
    rendez_vous = relationship("RendezVous", back_populates="patient")
    dossiers = relationship("DossierMedical", back_populates="patient")
    analyses = relationship("ResultatAnalyse", back_populates="patient")