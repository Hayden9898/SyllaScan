from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Settings(BaseSettings):
    CLIENT_ID: str = os.getenv("CLIENT_ID")
    CLIENT_SECRET: str = os.getenv("CLIENT_SECRET")
    API_KEY: str = os.getenv("API_KEY")
    APP_ID: str = os.getenv("APP_ID")


settings = Settings()


# need to accept only .txt, .docx, .pdf files
@app.post("/upload", response_model=dict)
async def upload(request: Request):
    form = await request.form()
    file = None
    contents = None

    if "file" in form:
        # Handle file upload scenario
        file = form["file"]  # FileUpload object from form
        if file:
            if not (
                file.filename.endswith(".txt")
                or file.filename.endswith(".docx")
                or file.filename.endswith(".pdf")
            ):
                raise HTTPException(status_code=415, detail="File type not supported")
            contents = await file.read()
        else:
            raise HTTPException(status_code=400, detail="No valid file part found")
    else:
        # No URL or file provided
        raise HTTPException(status_code=400, detail="No file or URL provided")

    # process with ai here
    # make_calendar_events()

    print(contents)
    return {"filename": file.filename}


@app.post("/get_file")
async def get_file(request: Request):
    request_body = await request.json()

    print(request_body)
    return {"message": "success"}
