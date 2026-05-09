"""
Auth adapter — swap between Local and Keycloak by setting AUTH_PROVIDER env var.

  AUTH_PROVIDER=local     → LocalAuthAdapter   (current email-only logic)
  AUTH_PROVIDER=keycloak  → KeycloakAuthAdapter (validates Keycloak JWTs)
"""

from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Optional

import httpx
from fastapi import HTTPException, status
from jose import JWTError, jwt

from config import settings


# ---------------------------------------------------------------------------
# Abstract contract — every adapter must implement these two methods
# ---------------------------------------------------------------------------

class AuthAdapter(ABC):
    """
    Contract every auth backend must satisfy.

    • `get_token`     — given a raw credential dict, return a signed token
                        (or raise HTTPException on failure).
    • `verify_token`  — given a raw token string, return the decoded payload
                        dict, or None if invalid / expired.
    """

    @abstractmethod
    def get_token(self, credentials: dict) -> dict:
        """
        Authenticate a user and return a token response dict.

        Args:
            credentials: arbitrary dict passed by the login route
                         (e.g. {"email": "..."} for local, or
                         {"username": ..., "password": ...} for Keycloak).

        Returns:
            {"access_token": str, "token_type": "bearer"}

        Raises:
            HTTPException on auth failure.
        """
        ...

    @abstractmethod
    def verify_token(self, token: str) -> Optional[dict]:
        """
        Validate a bearer token and return its payload.

        Returns:
            Decoded payload dict, or None if the token is invalid/expired.
        """
        ...


# ---------------------------------------------------------------------------
# Local adapter — wraps your existing email-based JWT logic
# ---------------------------------------------------------------------------

class LocalAuthAdapter(AuthAdapter):
    """
    Validates users against the local DB and mints HS256 JWTs.
    Delegates to the original services/auth.py helpers so that file keeps
    working unchanged.
    """

    def get_token(self, credentials: dict) -> dict:
        from database import SessionLocal
        from models.user_auth import UserAuth
        from services.auth import create_access_token  # original helper

        email = credentials.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="email is required for local auth",
            )

        db = SessionLocal()
        try:
            user = db.query(UserAuth).filter(UserAuth.email == email).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User not found",
                )
            token = create_access_token({"sub": str(user.id), "role": user.role})
            return {"access_token": token, "token_type": "bearer"}
        finally:
            db.close()

    def verify_token(self, token: str) -> Optional[dict]:
        from services.auth import verify_token as _verify  # original helper
        return _verify(token)


# ---------------------------------------------------------------------------
# Keycloak adapter — validates RS256 JWTs issued by a Keycloak realm
# ---------------------------------------------------------------------------

class KeycloakAuthAdapter(AuthAdapter):
    """
    Verifies tokens signed by Keycloak using the realm's public key fetched
    from the OIDC discovery endpoint (/.well-known/openid-configuration).

    Required settings (see config.py / env vars):
        KEYCLOAK_URL        e.g. https://auth.example.com
        KEYCLOAK_REALM      e.g. myrealm
        KEYCLOAK_CLIENT_ID  e.g. myapp-backend
    """

    def __init__(self) -> None:
        self._jwks_cache: Optional[dict] = None

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def get_token(self, credentials: dict) -> dict:
        """
        Exchange username+password for a Keycloak token via Resource Owner
        Password Credentials (ROPC) flow.

        Note: ROPC is deprecated in OAuth 2.1. Prefer the Authorization Code
        flow with PKCE in production — in that case your frontend obtains the
        token directly from Keycloak and this method is never called from
        the backend.  It is provided here for parity with the local adapter.
        """
        username = credentials.get("username")
        password = credentials.get("password")
        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="username and password are required for Keycloak auth",
            )

        token_url = (
            f"{settings.keycloak_url}/realms/{settings.keycloak_realm}"
            "/protocol/openid-connect/token"
        )
        try:
            response = httpx.post(
                token_url,
                data={
                    "grant_type": "password",
                    "client_id": settings.keycloak_client_id,
                    "username": username,
                    "password": password,
                },
                timeout=10,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Keycloak authentication failed: {exc.response.text}",
            ) from exc
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not reach Keycloak: {exc}",
            ) from exc

        data = response.json()
        return {
            "access_token": data["access_token"],
            "token_type": "bearer",
        }

    def verify_token(self, token: str) -> Optional[dict]:
        """
        Validate the JWT signature against Keycloak's JWKS, then return
        the decoded claims dict.  Returns None on any failure.
        """
        try:
            jwks = self._get_jwks()
            # jose.jwt.decode handles RS256 key selection from the JWKS
            payload = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience=settings.keycloak_client_id,
            )
            # Normalise role claim so the rest of the app stays unchanged:
            # Keycloak puts roles under resource_access.<client>.roles
            payload.setdefault("role", self._extract_role(payload))
            return payload
        except JWTError:
            return None

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _get_jwks(self) -> dict:
        """Fetch (and cache in-process) the Keycloak JWKS."""
        if self._jwks_cache:
            return self._jwks_cache

        jwks_url = (
            f"{settings.keycloak_url}/realms/{settings.keycloak_realm}"
            "/protocol/openid-connect/certs"
        )
        try:
            resp = httpx.get(jwks_url, timeout=10)
            resp.raise_for_status()
            self._jwks_cache = resp.json()
            return self._jwks_cache
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not fetch Keycloak JWKS: {exc}",
            ) from exc

    @staticmethod
    def _extract_role(payload: dict) -> Optional[str]:
        """
        Pull the first realm role out of the Keycloak token claims.

        Keycloak token structure (simplified):
          {
            "realm_access": {"roles": ["offline_access", "admin"]},
            "resource_access": {"myapp": {"roles": ["editor"]}}
          }

        Adjust this logic to match your realm's role mapping.
        """
        client_roles = (
            payload.get("resource_access", {})
            .get(settings.keycloak_client_id, {})
            .get("roles", [])
        )
        if client_roles:
            return client_roles[0]

        realm_roles = payload.get("realm_access", {}).get("roles", [])
        # Filter out Keycloak's built-in roles
        custom_roles = [r for r in realm_roles if not r.startswith("offline")]
        return custom_roles[0] if custom_roles else None


# ---------------------------------------------------------------------------
# Factory — import this everywhere instead of concrete classes
# ---------------------------------------------------------------------------

def get_auth_adapter() -> AuthAdapter:
    """
    Return the correct adapter based on the AUTH_PROVIDER environment variable.

    Usage (in dependencies.py, routers, etc.):
        from services.auth_adapter import get_auth_adapter
        adapter = get_auth_adapter()
    """
    provider = os.getenv("AUTH_PROVIDER", "local").lower()
    if provider == "keycloak":
        return KeycloakAuthAdapter()
    return LocalAuthAdapter()