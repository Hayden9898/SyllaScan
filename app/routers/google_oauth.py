import json
import secrets
from urllib.parse import quote, unquote

import jwt
import requests
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from helpers.google_credentials import GoogleOAuth

router = APIRouter()
oauth = GoogleOAuth()

ALLOWED_REDIRECTS = ["/", "/upload", "/export"]
SECRET_KEY = secrets.token_urlsafe(32)


def preprocess_redirect_to(redirect_to: str = "/") -> str:
    redirect_to = unquote(redirect_to)
    if not redirect_to or redirect_to not in ALLOWED_REDIRECTS:
        print("Invalid redirect URL")
        redirect_to = "/"
    return redirect_to


def validate_state(request: Request, state: str) -> dict:
    try:
        return jwt.decode(state, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return {"redirect_to": "/", "nonce": ""}


@router.get("/")
def google_oauth(
    request: Request,
    response: Response,
    redirect_to: str = Depends(preprocess_redirect_to),
):
    state = jwt.encode(
        {
            "redirect_to": quote(redirect_to),
            "nonce": secrets.token_urlsafe(16),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=True,
        max_age=300,
    )

    # Construct the authorization URL
    auth_url = f"{oauth.auth_url}&redirect_to={redirect_to}&state={state}"

    return RedirectResponse(auth_url)


@router.get("/callback")
def google_callback(request: Request, state: str = Depends(validate_state)):
    redirect_to = preprocess_redirect_to(state.get("redirect_to", "/"))

    try:
        # Exchange the authorization code for tokens
        token_response = oauth.retrieve_token(request, grant_type="authorization_code")
    except Exception as e:
        print(f"Error retrieving token: {e}")
        return RedirectResponse(url=f"/oauth/google?redirect_to={redirect_to}", status_code=303)

    # Validate token response
    access_token = token_response.get("access_token")
    refresh_token = token_response.get("refresh_token")
    if not access_token or not refresh_token:
        return RedirectResponse(url=f"/oauth/google?redirect_to={redirect_to}", status_code=303)

    # Create a response to redirect the user
    redirect_url = f"http://localhost:3000{redirect_to}"
    response = RedirectResponse(url=redirect_url, status_code=303)

    # Securely store tokens in cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="None",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="None",
    )

    return response


@router.post("/check_scopes")
async def call_check_scopes(request: Request):
    """
    Checks if the access token has the required Google OAuth scopes.
    """
    req_json = await request.json()
    return oauth.check_scopes(request, req_json.get("scopes"))


@router.get("/refresh")
def refresh_token(request: Request):
    """
    Refreshes the Google OAuth token using the refresh token.
    """
    token_response = oauth.retrieve_token(request, grant_type="refresh_token")

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
        revoke_url = "https://oauth2.googleapis.com/revoke"
        try:
            response = requests.post(
                revoke_url,
                data={"token": access_token},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10,
            )
            if response.status_code != 200:
                print("Token is invalid or already revoked.")
        except Exception as e:
            print(f"Token revoke request failed: {e}, {response.content}")

    response = RedirectResponse(url="http://localhost:3000", status_code=303)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


@router.get("/check_auth")
def check_auth(request: Request):
    auth_token = request.cookies.get("access_token")
    return {"authenticated": auth_token}


@router.get("/get_token")
def get_access_token(request: Request) -> dict:
    """
    Validates the Referer header and returns the access token if valid.

    Args:
        request (Request): The FastAPI request object.
        allowed_origin (str): The allowed origin (e.g., "http://localhost:3000").

    Returns:
        str: The valid access token.

    Raises:
        HTTPException: If the Referer is invalid, token is missing, or token is invalid.
    """
    # Validate the Referer header
    referer = request.headers.get("referer")
    if not referer or not referer.startswith("http://localhost:3000"):
        raise HTTPException(status_code=403, detail="Invalid Referer")

    # Retrieve tokens from cookies
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")

    if not access_token and not refresh_token:
        raise HTTPException(
            status_code=401, detail="Missing access token and refresh token"
        )

    credentials = oauth.get_credentials(request)
    return {"access_token": access_token, "expired": credentials.expired, "ok": True}
