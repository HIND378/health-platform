from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
class UserBase(BaseModel):
    email: str
    role: str
    actif: bool


class UserCreate(UserBase):
    keycloak_id: str


class User(UserBase):
    id: UUID

    class Config:
        from_attributes = True
