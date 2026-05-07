"""
Centralised settings — loaded once at startup from environment variables.

Local auth:
    AUTH_PROVIDER=local   (default)
    SECRET_KEY            your HS256 signing key
    ACCESS_TOKEN_EXPIRE_MINUTES  (optional, default 60)

Keycloak auth:
    AUTH_PROVIDER=keycloak
    KEYCLOAK_URL          e.g. https://auth.example.com
    KEYCLOAK_REALM        e.g. myrealm
    KEYCLOAK_CLIENT_ID    e.g. myapp-backend
"""

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    # ── Shared ────────────────────────────────────────────────────────────
    auth_provider: str = field(
        default_factory=lambda: os.getenv("AUTH_PROVIDER", "local").lower()
    )

    # ── Local adapter ─────────────────────────────────────────────────────
    secret_key: str = field(
        default_factory=lambda: os.getenv("SECRET_KEY", "SUPER_SECRET_KEY")
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = field(
        default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    )

    # ── Keycloak adapter ──────────────────────────────────────────────────
    keycloak_url: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    )
    keycloak_realm: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_REALM", "myrealm")
    )
    keycloak_client_id: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_CLIENT_ID", "myapp-backend")
    )


# Single instance imported everywhere
settings = Settings()