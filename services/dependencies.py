from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
 
from services.auth_adapter import get_auth_adapter
 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
 
 
def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validate the bearer token using whichever auth adapter is active.
    Returns the decoded payload dict — same shape as before for callers.
    """
    adapter = get_auth_adapter()
    payload = adapter.verify_token(token)
 
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
 
    return payload
 
 
def require_role(required_role: str):
    """Role guard — unchanged API, works with both adapters."""
    def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return user
 
    return role_checker