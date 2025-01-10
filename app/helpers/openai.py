from typing import List
from uuid import uuid4
import io
import json
import os
from fastapi import BackgroundTasks, HTTPException, UploadFile
from openai import OpenAI

client = OpenAI()

async def process_upload(
    files: List[UploadFile],
    background_tasks: BackgroundTasks = None,
) -> dict:
    ret = None
    if os.getenv("OPENAI_API") == "false":
        with open("dummy_json.json") as f:
            ret = json.loads(f.read())
    else:
        if not files:
            print("No valid files")
            raise HTTPException(status_code=400, detail="No valid files provided")

        # Filter out files that are not .txt, .docx, or .pdf
        valid_files = [
            file
            for file in files
            if file.filename.endswith(".txt")
            or file.filename.endswith(".docx")
            or file.filename.endswith(".pdf")
            or file.filename.endswith(".csv")
            or file.filename.endswith(".pptx")
        ]

        if not valid_files:
            raise HTTPException(status_code=400, detail="No valid files uploaded")

        instance_name = str(uuid4())

        temp_files = []
        for file in valid_files:
            file_content = await file.read()
            temp_file = io.BytesIO(file_content)
            temp_file.name = file.filename
            temp_files.append(temp_file)

        # Create and configure the assistant
        assistant = client.beta.assistants.create(
            name=instance_name,
            instructions='You are an intelligent data parser designed to extract and organize schedule-related information from PDFs, Word documents, and text files. Your task is to analyze these files, identify key details such as course names, dates, times, and locations, and compile this data into a structured student schedule format that is easy to understand and use. Ensure accuracy in parsing and logical organization of the schedule information. Should there be no information to extract, return "[]" and nothing else along with it. Otherwise, return the schedule in json text format without the ```json * ```, without newlines and with no other text, [{summary: [Course Name and Assignment Name], dt_start: [dt_start], dt_end: [dt_end], location: [location], description: [description], misc_info: [misc_info]}]. Should a field have no information to extract, return null in place. summary, dt_start and dt_end are required fields. location, description, and misc_info are optional fields. dt_* format is YYYY-MM-DD HH-mm-ss. Should there be no information for dt_end, it should be dt_start + 15 minutes.',
            model="gpt-4o",
            tools=[{"type": "file_search"}],
        )

        vector_store = client.beta.vector_stores.create(name=instance_name)

        # Upload files and poll for completion
        file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=vector_store.id, files=temp_files
        )

        if file_batch.status != "completed":
            raise HTTPException(status_code=500, detail="File batch upload failed.")

        assistant = client.beta.assistants.update(
            assistant_id=assistant.id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
        )

        thread = client.beta.threads.create(
            messages=[
                {
                    "role": "user",
                    "content": "Extract and organize schedule-related information.",
                }
            ]
        )

        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread.id, assistant_id=assistant.id
        )

        messages = client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id)
        message_content = messages.data[0].content[0].text
        try:
            response = json.loads(message_content.value)
        except json.JSONDecodeError:
            response = message_content.value

        annotations = message_content.annotations
        citations = []
        for index, annotation in enumerate(annotations):
            message_content = message_content.replace(annotation.text, f"[{index}]")
            if file_citation := getattr(annotation, "file_citation", None):
                cited_file = client.files.retrieve(file_citation.file_id)
                citations.append(f"[{index}] {cited_file.filename}")

        # Schedule cleanup tasks
        background_tasks.add_task(
            cleanup_resources, vector_store.id, assistant.id, thread.id, file_batch.id
        )

        ret = {
            "ok": True,
            "filenames": [file.filename for file in valid_files],
            "schedule_content": {
                "annotations": annotations,
                "value": message_content.value,
            },
            "citations": citations,
            "response": response,
        }

    return ret


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
