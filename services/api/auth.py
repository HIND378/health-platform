from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user_auth import UserAuth
from services.auth import create_access_token

router = APIRouter()

@router.post("/login")
def login(email: str, db: Session = Depends(get_db)):
    user = db.query(UserAuth).filter(UserAuth.email == email).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {"access_token": token, "token_type": "bearer"}
