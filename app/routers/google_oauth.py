import os
import secrets

import requests
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow

# OAuth configuration
oauth_conf = {
    "client_id": os.getenv("CLIENT_ID"),
    "client_secret": os.getenv("CLIENT_SECRET"),
    "redirect_uri": "http://localhost:8000/oauth/callback",
    "scopes": [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.file",
    ],
}
CLIENT_ID = oauth_conf["client_id"]
CLIENT_SECRET = oauth_conf["client_secret"]
SCOPES = oauth_conf["scopes"]
TOKEN_URI = "https://oauth2.googleapis.com/token"
AUTH_URI = "https://accounts.google.com/o/oauth2/auth"

router = APIRouter()


@router.get("/")
def google_oauth(response: Response):
    # Generate a unique state value
    state = secrets.token_urlsafe(16)

    # Store the state in an HTTP-only cookie
    response.set_cookie(key="oauth_state", value=state, httponly=True, secure=True)

    # Construct the authorization URL
    auth_url = (
        f"{AUTH_URI}?client_id={CLIENT_ID}"
        f"&redirect_uri=http://localhost:8000/oauth/google/callback"
        f"&response_type=code&scope={' '.join(SCOPES)}"
        f"&state={state}&access_type=offline"
    )
    return RedirectResponse(auth_url)


@router.get("/callback")
def google_callback(request: Request, state: str, code: str):
    # Exchange the authorization code for tokens
    token_request_data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": "http://localhost:8000/oauth/google/callback",
        "grant_type": "authorization_code",
        "scope": " ".join(SCOPES),
    }
    try:
        response = requests.post(TOKEN_URI, data=token_request_data, timeout=10)
        response.raise_for_status()
        token_response = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Token exchange failed: {str(e)}"
        ) from None

    response = RedirectResponse(url="http://localhost:3000", status_code=303)

    response.set_cookie(
        key="access_token",
        value=token_response.get("access_token"),
        httponly=True,
        secure=True,
        samesite="None",
    )
    response.set_cookie(
        key="refresh_token",
        value=token_response.get("refresh_token"),
        httponly=True,
        secure=True,
        samesite="None",
    )

    return response


@router.get("/check_scopes")
def check_scopes(request: Request):
    """
    Returns the Google OAuth scopes dynamically by initializing the flow.
    """
    try:
        # Initialize the OAuth flow with environment variables
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[],  # Initialize with an empty list to check later
        )

        # Retrieve the default scopes from the flow (if any)
        scopes = flow.client_config.get("scopes", [])

        # Check if the required scopes are present in the default scopes
        missing_scopes = set(SCOPES) - set(scopes)
        print(missing_scopes, request.cookies.get("access_token"))
        if missing_scopes:
            return {"error": f"Missing required scopes: {missing_scopes}"}
        return {"has_scopes": True}
    except Exception as e:
        return {"error": str(e)}


@router.get("/refresh")
def refresh_token(request: Request):
    """
    Refreshes the Google OAuth token using the refresh token.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    token_request_data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    try:
        response = requests.post(TOKEN_URI, data=token_request_data, timeout=10)
        response.raise_for_status()
        token_response = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Token refresh failed: {str(e)}"
        ) from None

    response = RedirectResponse(url="http://localhost:3000", status_code=303)
    response.set_cookie(
        key="access_token",
        value=token_response.get("access_token"),
        httponly=True,
        secure=True,
        samesite="None",
    )

    response.set_cookie(
        key="refresh_token",
        value=token_response.get("refresh_token"),
        httponly=True,
        secure=True,
        samesite="None",
    )

    return response


@router.get("/revoke")
def revoke_token(request: Request):
    """
    Revokes the Google OAuth token.
    """
    access_token = request.cookies.get("access_token")
    if access_token:
        revoke_url = f"https://oauth2.googleapis.com/revoke?token={access_token}"
        try:
            response = requests.post(revoke_url, timeout=10)
            response.raise_for_status()
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Token revoke failed: {str(e)}"
            ) from None

    response = RedirectResponse(url="http://localhost:3000", status_code=303)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


@router.get("/check_auth")
def check_auth(request: Request):
    auth_token = request.cookies.get("access_token")
    return {"authenticated": auth_token}
