from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class NotificationBase(BaseModel):
    type: str
    canal: str
    message: str
    lu: bool


class NotificationCreate(NotificationBase):
    user_id: UUID


class Notification(NotificationBase):
    id: UUID
    envoyee_at: datetime

    class Config:
        from_attributes = True