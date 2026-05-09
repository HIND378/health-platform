from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from models.patient import Patient
from models.medecin import Medecin
from database import Base

class UserAuth(Base):
    __tablename__ = "users_auth"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String)
    role = Column(String)
    keycloak_id = Column(String)
    actif = Column(Boolean)

    patient = relationship("Patient", back_populates="user")
    medecin = relationship("Medecin", back_populates="user")