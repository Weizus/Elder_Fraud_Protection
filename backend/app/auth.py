import os
from functools import wraps

import jwt
from flask import g, jsonify, request
from jwt import InvalidTokenError, PyJWKClient


def _get_bearer_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip() or None


def _get_jwks_url():
    configured_jwks = os.getenv("CLERK_JWKS_URL")
    if configured_jwks:
        return configured_jwks

    issuer = os.getenv("CLERK_ISSUER")
    if issuer:
        return f"{issuer.rstrip('/')}/.well-known/jwks.json"

    return None


def _verify_token(token):
    jwks_url = _get_jwks_url()
    if not jwks_url:
        return None, "Clerk verification is not configured. Set CLERK_JWKS_URL or CLERK_ISSUER."

    issuer = os.getenv("CLERK_ISSUER")
    audience = os.getenv("CLERK_AUDIENCE")

    try:
        jwk_client = PyJWKClient(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        decode_kwargs = {
            "key": signing_key.key,
            "algorithms": ["RS256"],
            "options": {"verify_aud": bool(audience)},
        }
        if issuer:
            decode_kwargs["issuer"] = issuer
        if audience:
            decode_kwargs["audience"] = audience

        payload = jwt.decode(token, **decode_kwargs)
        return payload, None
    except InvalidTokenError as exc:
        return None, f"Invalid Clerk token: {exc}"
    except Exception as exc:  # pragma: no cover
        return None, f"Unable to verify Clerk token: {exc}"


def load_auth_context():
    token = _get_bearer_token()
    g.auth_user = None
    g.auth_error = None
    g.is_authenticated = False

    if not token:
        return

    payload, error = _verify_token(token)
    if error:
        g.auth_error = error
        return

    g.auth_user = {
        "user_id": payload.get("sub"),
        "session_id": payload.get("sid"),
        "issuer": payload.get("iss"),
    }
    g.is_authenticated = True


def require_auth(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if not getattr(g, "is_authenticated", False):
            return jsonify({"error": "Authentication required"}), 401
        return view_func(*args, **kwargs)

    return wrapped
