import icalendar
import datetime
import json
import os
import tempfile
from fastapi.responses import FileResponse
from fastapi import BackgroundTasks

def create_calendar(events_json: json) -> FileResponse:
    cal = icalendar.Calendar()
    for event in events_json:
        cal.add_component(create_event(event))
    return cal


def create_event(event: json):
    if event["dt_start"] is None or event["dt_end"] is None or event["summary"] is None:
        return None

    if event["location"] is None:
        event["location"] = ""

    if event["description"] is None:
        event["description"] = ""
    else:
        event["description"] += "\n\n"

    if event["misc_info"] is None:
        event["misc_info"] = ""

    dt_start = datetime.datetime.strptime(event["dt_start"], "%Y-%m-%d %H:%M:%S")
    dt_end = datetime.datetime.strptime(event["dt_end"], "%Y-%m-%d %H:%M:%S")
    ical_event = icalendar.Event()
    ical_event.add("summary", event["summary"])
    ical_event.add("dtstart", dt_start)
    ical_event.add("dtend", dt_end)
    ical_event.add("location", event.get("location"))
    ical_event.add(
        "description", event.get("description") + event.get("misc_info")
    )
    return ical_event


def get_calendar_file(cal: icalendar.Calendar, background_tasks: BackgroundTasks):
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ics") as temp_file:
        temp_file.write(cal.to_ical())
        temp_file_path = temp_file.name  # Save the file path

    background_tasks.add_task(os.remove, temp_file_path)  # Close the file after the response is sent
    print(temp_file_path)
    return FileResponse(
        temp_file_path, media_type="text/calendar", filename="calendar.ics"
    )


def save_calendar(cal: icalendar.Calendar, filename: str):
    with open(filename, "wb") as file:
        file.write(cal.to_ical())
