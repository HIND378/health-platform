from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
 
from database import get_db
from services.auth import create_access_token
 
router = APIRouter()
 
 
@router.post("/login")
def login(email: str, db: Session = Depends(get_db)):
    """
    Login endpoint.
 
    • Local mode  → authenticates by email against the local DB.
    • Keycloak    → in ROPC flow, pass username+password instead; but in
                    production you'll remove this endpoint entirely and let
                    the frontend authenticate directly with Keycloak.
 
    The db dependency is kept here so the route signature doesn't change;
    LocalAuthAdapter opens its own session internally (safe to have two).
    """
    adapter = get_auth_adapter()
    return adapter.get_token({"email": email})
 
