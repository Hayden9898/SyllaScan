from datetime import datetime, timedelta
import io
import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, UploadFile
from googleapiclient.discovery import build
from helpers.calendar import convert_to_gcal, convert_to_utc
from helpers.google_credentials import GoogleOAuth
from helpers.openai import process_upload
from httpx import AsyncClient

router = APIRouter()
oauth = GoogleOAuth()


@router.post("/get_files")
async def get_files(request: Request, background_tasks: BackgroundTasks) -> dict:
    files = await request.json()

    if not files or not isinstance(files, list):
        raise HTTPException(status_code=400, detail="No file links provided")

    bearer = f"Bearer {request.cookies.get('access_token')}"

    temp_files = []

    async with AsyncClient(timeout=60) as client:
        for file_id in files:
            try:
                # Fetch metadata
                metadata_response = await client.get(
                    f"https://www.googleapis.com/drive/v3/files/{file_id}",
                    headers={"Authorization": bearer},
                    timeout=10.0,
                )

                if metadata_response.status_code != 200:
                    print(f"Failed to fetch metadata for file_id: {file_id}")
                    continue

                metadata = metadata_response.json()
                mime_type = metadata.get("mimeType", "application/octet-stream")
                name = metadata.get("name", f"file_{uuid.uuid4()}")

                # Determine export format for Google Workspace files
                if mime_type.startswith("application/vnd.google-apps."):
                    export_format = None
                    if "document" in mime_type:
                        export_format = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"  # .docx
                        name = name if name.endswith(".docx") else name + ".docx"
                    elif "spreadsheet" in mime_type:
                        export_format = "text/csv"  # .csv
                        name = name if name.endswith(".csv") else name + ".csv"
                    elif "presentation" in mime_type:
                        export_format = "application/vnd.openxmlformats-officedocument.presentationml.presentation"  # .pptx
                        name = name if name.endswith(".pptx") else name + ".pptx"

                    if export_format:
                        file_response = await client.get(
                            f"https://www.googleapis.com/drive/v3/files/{file_id}/export?mimeType={export_format}",
                            headers={"Authorization": bearer},
                            timeout=10.0,
                        )
                    else:
                        print(
                            f"Unsupported Google Workspace file type for file_id: {file_id}"
                        )
                        continue
                else:
                    # Fetch binary file
                    file_response = await client.get(
                        f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
                        headers={"Authorization": bearer},
                        timeout=10.0,
                    )

                if file_response.status_code == 200:
                    # Prepare file as UploadFile for process_upload
                    temp_file = io.BytesIO(file_response.content)
                    temp_file.name = name
                    upload_file = UploadFile(file=temp_file, filename=name)
                    temp_files.append(upload_file)
                else:
                    print(f"Failed to fetch file content for file_id: {file_id}")

            except Exception as e:
                print(f"Error processing file {file_id}: {e}")

    if not temp_files:
        raise HTTPException(status_code=400, detail="No valid files could be fetched")

    # Call the process_upload function with the converted files
    return await process_upload(files=temp_files, background_tasks=background_tasks)


@router.post("/export/gcal")
async def export_to_gcal(request: Request) -> dict:
    data = await request.json()

    credentials = oauth.get_credentials(request)
    service = build("calendar", "v3", credentials=credentials)

    calendars = service.calendarList().list().execute()

    created_calendar = None

    for calendar in calendars.get("items", []):
        if calendar.get("summary") == "SyllaScan Calendar": # Check if the calendar already exists
            created_calendar = calendar

    if not created_calendar: # Create a new calendar if it doesn't exist
        calendar = {"summary": "SyllaScan Calendar", "timeZone": "America/Toronto"}
        created_calendar = service.calendars().insert(body=calendar).execute()

    data = convert_to_gcal(data)

    for event in data:
        events = get_events(service, created_calendar["id"], event["start"], event["end"])
        if not event_conflicting(events, event):
            created_event = (
                service.events().insert(calendarId=created_calendar["id"], body=event).execute()
            )

            print(f"Event created: {created_event['htmlLink']}")

    return {
        "calendar_id": created_calendar["id"],
        "ok": True,
    }


def get_events(service, calendar_id, start_time, end_time):
    # Fetch events from the calendar
    temp_end = end_time
    dt = datetime.strptime(temp_end["dateTime"], "%Y-%m-%dT%H:%M:%S")
    if start_time["dateTime"] == temp_end["dateTime"]:
        dt += timedelta(minutes=1)
        temp_end["dateTime"] = datetime.strftime(dt, "%Y-%m-%dT%H:%M:%S")

    events_result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=convert_to_utc(start_time["dateTime"], start_time["timeZone"]),
            timeMax=convert_to_utc(temp_end["dateTime"], temp_end["timeZone"]),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    return events_result.get("items", [])


def check_overlapping(event1, event2):
    # Standardize datetime strings by removing timezone offsets and 'Z'
    def normalize_datetime(dt_str):
        if "-" in dt_str[-6:] or "+" in dt_str[-6:]:
            dt_str = dt_str[:-6]  # Remove timezone offset
        return dt_str.replace("Z", "+00:00")  # Ensure consistent ISO format

    # Normalize event datetimes
    event1["start"]["dateTime"] = normalize_datetime(event1["start"]["dateTime"])
    event1["end"]["dateTime"] = normalize_datetime(event1["end"]["dateTime"])
    event2["start"]["dateTime"] = normalize_datetime(event2["start"]["dateTime"])
    event2["end"]["dateTime"] = normalize_datetime(event2["end"]["dateTime"])

    # Parse the datetime strings
    start1 = datetime.fromisoformat(event1["start"]["dateTime"])
    end1 = datetime.fromisoformat(event1["end"]["dateTime"])
    start2 = datetime.fromisoformat(event2["start"]["dateTime"])
    end2 = datetime.fromisoformat(event2["end"]["dateTime"])

    # Check for overlap
    return start1 < end2 and start2 < end1


def event_conflicting(events, event):
    for i in range(len(events)):
        if check_overlapping(events[i], event):
            if events[i]["summary"] == event["summary"]:
                return True
    return False
