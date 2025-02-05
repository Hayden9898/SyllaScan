from typing import List

import helpers.calendar as calendar
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from helpers.openai import process_upload
from routers import google, google_oauth, microsoft

load_dotenv()

app = FastAPI()
app.include_router(google_oauth.router, prefix="/oauth/google", tags=["oauth/google"])
app.include_router(google.router, prefix="/google", tags=["google"])
app.include_router(microsoft.router, prefix="/microsoft", tags=["microsoft"])

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload", response_model=dict)
async def upload(
    request: Request,
    files: List[UploadFile] = None,
    background_tasks: BackgroundTasks = None,
):
    if files is None:
        raise HTTPException(status_code=400, detail="No files uploaded")
    return await process_upload(files=files, background_tasks=background_tasks)


@app.post("/download_calendar")
async def download_calendar(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    cal = calendar.create_calendar(data)
    return calendar.get_calendar_file(cal, background_tasks)
