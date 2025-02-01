import os
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv
from fastapi import Request
from fastapi.exceptions import HTTPException
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
import requests

load_dotenv()


class GoogleOAuth:
    def __init__(self):
        """
        Initializes the GoogleOAuth configuration.
        """
        self.client_id = os.getenv("CLIENT_ID")
        self.client_secret = os.getenv("CLIENT_SECRET")
        self.scopes = [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.file",
        ]
        self.token_uri = "https://oauth2.googleapis.com/token"
        self.auth_uri = "https://accounts.google.com/o/oauth2/auth"
        self.auth_url = f"{self.auth_uri}?" + urlencode(
            {
                "client_id": self.client_id,
                "redirect_uri": "http://localhost:8000/oauth/google/callback",
                "response_type": "code",
                "scope": " ".join(self.scopes),
                "access_type": "offline",
                "prompt": "consent",
            }
        )

    def get_credentials(self, request: Request) -> Credentials:
        """
        Returns Google OAuth2 credentials based on cookies in the request.
        If the access token is missing or expired, attempts to refresh it.
        """
        token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        if not token and not refresh_token:
            raise HTTPException(
                status_code=401, detail="Missing access token and refresh token"
            )

        credentials = Credentials(
            token=token,
            refresh_token=refresh_token,
            client_id=self.client_id,
            client_secret=self.client_secret,
            token_uri=self.token_uri,
            scopes=self.scopes,
        )

        # Refresh the token if it is missing or expired
        if not token or credentials.expired:
            if not credentials.refresh_token:
                raise HTTPException(
                    status_code=401, detail="Unable to refresh token; refresh token is missing"
                )

            try:
                credentials.refresh(GoogleRequest())
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Failed to refresh token: {str(e)}"
                ) from e

        return credentials

    def get_token_request_data(
        self, request: Request, grant_type: str = "authorization_code"
    ) -> dict:
        """
        Returns the token request data based on the grant type.
        """
        if grant_type == "authorization_code":
            return {
                "code": request.query_params.get("code"),
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": "http://localhost:8000/oauth/google/callback",
                "grant_type": "authorization_code",
            }
        elif grant_type == "refresh_token":
            return {
                "refresh_token": request.cookies.get("refresh_token"),
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "refresh_token",
            }
        else:
            raise ValueError(f"Unsupported grant_type: {grant_type}")

    def retrieve_token(
        self, request: Request, grant_type: str = "authorization_code"
    ) -> dict:
        """
        Retrieves the token from Google based on the grant type.
        """
        try:
            token_request_data = self.get_token_request_data(request, grant_type)
            response = requests.post(
                self.token_uri, data=token_request_data, timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500, detail=f"Token retrieval failed: {str(e)}"
            ) from e


    def check_scopes(self, request: Request):
        """
        Checks if the access token has the required Google OAuth scopes.
        """
        try:
            token_scopes = self.get_scopes(request.cookies.get("access_token"))
            missing_scopes = set(self.scopes) - token_scopes

            if missing_scopes:
                return HTTPException(status_code=401, detail="Insufficient scopes")
            return {"has_scopes": True}
        except Exception as e:
            return HTTPException(status_code=500, detail="Unexpected error")


    @staticmethod
    def get_scopes(access_token: str) -> set[str]:
        """
        Calls Google's token info endpoint to retrieve the actual scopes for this token.
        """
        response = requests.get(
            "https://www.googleapis.com/oauth2/v1/tokeninfo",
            params={"access_token": access_token},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        # data["scope"] is a space-separated string of scopes
        token_scopes_str = data.get("scope", "")
        return set(token_scopes_str.split())
