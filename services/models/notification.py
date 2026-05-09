from sqlalchemy import Column, String, Boolean, Integer, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid

from database import Base
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users_auth.id"))
    type = Column(String)
    canal = Column(String)
    message = Column(Text)
    lu = Column(Boolean)
    envoyee_at = Column(TIMESTAMP)