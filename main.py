import os

from fastapi import FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
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
async def upload(request: Request, file: UploadFile = None):
    if file is None or file.filename == "":
        return HTTPException(status_code=400, detail="No valid file part found")

    # Handle file upload scenario
    if not (
        file.filename.endswith(".txt")
        or file.filename.endswith(".docx")
        or file.filename.endswith(".pdf")
    ):
        return HTTPException(status_code=415, detail="File type not supported")

    assistant = client.beta.assistants.create(
        name="Data Parser",
        instructions="You are an intelligent data parser designed to extract and organize schedule-related information from PDFs, Word documents, and text files. Your task is to analyze these files, identify key details such as course names, dates, times, and locations, and compile this data into a structured student schedule format that is easy to understand and use. Ensure accuracy in parsing and logical organization of the schedule information.",
        model="gpt-4o",
        tools=[{"type": "file_search"}],
    )

    vector_store = client.beta.vector_stores.create(name="Data Parser")

    file_streams = [file]

    # Use the upload and poll SDK helper to upload the files, add them to the vector store,
    # and poll the status of the file batch for completion.
    file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store.id, files=file_streams
    )

    # You can print the status and the file counts of the batch to see the result of this operation.
    print(file_batch.status)
    print(file_batch.file_counts)

    assistant = client.beta.assistants.update(
        assistant_id=assistant.id,
        tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
    )

    # Upload the user provided file to OpenAI
    message_file = client.files.create(
        file=file, purpose="assistants"
    )

    # Create a thread and attach the file to the message
    thread = client.beta.threads.create(
        messages=[
            {
                "role": "user",
                "content": "How many shares of AAPL were outstanding at the end of of October 2023?",
                # Attach the new file to the message.
                "attachments": [
                    {"file_id": message_file.id, "tools": [{"type": "file_search"}]}
                ],
            }
        ]
    )

    # The thread now has a vector store with that file in its tool resources.
    print(thread.tool_resources.file_search)

    # Use the create and poll SDK helper to create a run and poll the status of
    # the run until it's in a terminal state.
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id, assistant_id=assistant.id
    )

    messages = list(
        client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id)
    )

    message_content = messages[0].content[0].text
    annotations = message_content.annotations
    citations = []
    for index, annotation in enumerate(annotations):
        message_content.value = message_content.value.replace(
            annotation.text, f"[{index}]"
        )
        if file_citation := getattr(annotation, "file_citation", None):
            cited_file = client.files.retrieve(file_citation.file_id)
            citations.append(f"[{index}] {cited_file.filename}")

    print(message_content.value)
    print("\n".join(citations))

    # process with ai here
    make_calendar_events()

    return {"filename": file.filename}

def make_calendar_events():
    pass
