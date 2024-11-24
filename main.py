import io
import json
from typing import List
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Request, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from httpx import AsyncClient
import uuid

load_dotenv()

client = OpenAI()

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def cleanup_resources(
    vector_store_id: str, assistant_id: str, thread_id: str, file_batch_id: str
):
    # Delete all files associated with the vector store
    if vector_store_id:
        file_list = client.beta.vector_stores.file_batches.list_files(
            vector_store_id=vector_store_id, batch_id=file_batch_id
        )
        for file in file_list.data:
            client.files.delete(file.id)

        # Delete the vector store itself
        client.beta.vector_stores.delete(vector_store_id)

    # Delete the assistant
    if assistant_id:
        client.beta.assistants.delete(assistant_id)

    # Delete the thread
    if thread_id:
        client.beta.threads.delete(thread_id)


# need to accept only .txt, .docx, .pdf files
@app.post("/upload", response_model=dict)
async def upload(
    request: Request,
    files: List[UploadFile] = None,
    background_tasks: BackgroundTasks = None,
):
    if files is None:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # filter out files that are not .txt, .docx, or .pdf
    files = [
        file
        for file in files
        if file.filename.endswith(".txt")
        or file.filename.endswith(".docx")
        or file.filename.endswith(".pdf")
    ]

    if not files:
        raise HTTPException(status_code=400, detail="No valid files uploaded")

    instance_name = str(uuid4())

    temp_files = []
    for file in files:
        file_content = file.file.read()
        temp_file = io.BytesIO(file_content)
        temp_file.name = file.filename
        temp_files.append(temp_file)

    assistant = client.beta.assistants.create(
        name=instance_name,
        instructions='You are an intelligent data parser designed to extract and organize schedule-related information from PDFs, Word documents, and text files. Your task is to analyze these files, identify key details such as course names, dates, times, and locations, and compile this data into a structured student schedule format that is easy to understand and use. Ensure accuracy in parsing and logical organization of the schedule information. Should there be no information to extract, return "[]" and nothing else along with it. Otherwise, return the schedule in json text format without the ```json * ```, without newlines and with no other text, [{Title: [Course Name], Date: [Date], Time: [Time], Location: [Location], Description: [Description], MiscInfo: [Misc. Info]}]. Should a field have no information to extract, return null in place. Title and Date are required fields. Time, Location, Description, and MiscInfo are optional fields.',
        model="gpt-4o",
        tools=[{"type": "file_search"}],
    )

    vector_store = client.beta.vector_stores.create(name=instance_name)

    # Use the upload and poll SDK helper to upload the files, add them to the vector store,
    # and poll the status of the file batch for completion.
    file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store.id, files=temp_files
    )

    # Check if the batch upload was successful
    if file_batch.status != "completed":
        raise HTTPException(status_code=500, detail="File batch upload failed.")

    # You can print the status and the file counts of the batch to see the result of this operation.
    print(file_batch.status)
    print(file_batch.file_counts)

    assistant = client.beta.assistants.update(
        assistant_id=assistant.id,
        tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
    )

    # Create a thread and attach the file to the message
    thread = client.beta.threads.create(
        messages=[
            {
                "role": "user",
                "content": "Extract and organize schedule-related information.",
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

    messages = client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id)
    message_content = messages.data[0].content[0].text
    try:
        response = json.loads(message_content.value)
    except json.JSONDecodeError:
        response = message_content.value

    print(response)

    annotations = message_content.annotations
    citations = []
    for index, annotation in enumerate(annotations):
        message_content = message_content.replace(annotation.text, f"[{index}]")
        if file_citation := getattr(annotation, "file_citation", None):
            cited_file = client.files.retrieve(file_citation.file_id)
            citations.append(f"[{index}] {cited_file.filename}")

    print(messages)
    print("\n".join(citations))

    # process with ai here
    make_calendar_events()

    background_tasks.add_task(
        cleanup_resources, vector_store.id, assistant.id, thread.id, file_batch.id
    )

    return {
        "ok": True,
        "filenames": [file.filename for file in files],
        "schedule_content": {
            "annotations": annotations,
            "value": message_content.value,
        },
        "citations": citations,
        "response": response,
    }


@app.post("/get_files")
async def get_files(request: Request):
    files = await request.json()

    if not files or not isinstance(files, list):
        raise HTTPException(status_code=400, detail="No file links provided")

    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # Prepare files for multipart response
    multipart_data = []

    async with AsyncClient() as client:
        for file_id in files:
            try:
                metadata_response = await client.get(
                    f"https://www.googleapis.com/drive/v3/files/{file_id}",
                    headers={"Authorization": authorization},
                    timeout=10.0,
                )

                if metadata_response.status_code != 200:
                    continue  # Skip failed files

                metadata = metadata_response.json()
                mime_type = metadata.get("mimeType")
                name = metadata.get("name", f"file_{uuid.uuid4()}")

                if mime_type.startswith("application/vnd.google-apps."):
                    # Export Google Docs Editors file
                    export_format = (
                        "application/pdf" if "document" in mime_type else "text/csv"
                    )
                    file_response = await client.get(
                        f"https://www.googleapis.com/drive/v3/files/{file_id}/export?mimeType={export_format}",
                        headers={"Authorization": authorization},
                        timeout=10.0,
                    )
                else:
                    # Fetch binary file
                    file_response = await client.get(
                        f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
                        headers={"Authorization": authorization},
                        timeout=10.0,
                    )

                if file_response.status_code == 200:
                    multipart_data.append(
                        {
                            "filename": name,
                            "content": file_response.content,
                            "content_type": mime_type,
                        }
                    )

            except Exception as e:
                print(f"Error processing file {file_id}: {e}")
                continue  # Skip failed files

    # Create a generator for multipart response
    # TODO: Get GPT to process files
    async def file_stream():
        boundary = f"boundary_{uuid.uuid4().hex}"
        for file in multipart_data:
            yield f"--{boundary}\r\n".encode()
            yield f"Content-Disposition: form-data; name=\"files\"; filename=\"{file['filename']}\"\r\n".encode()
            yield f"Content-Type: {file['content_type']}\r\n\r\n".encode()
            yield file["content"]
            yield b"\r\n"
        yield f"--{boundary}--\r\n".encode()

    return StreamingResponse(
        file_stream(),
        media_type="multipart/form-data",
    )


def make_calendar_events():
    pass
