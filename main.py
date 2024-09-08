from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

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
