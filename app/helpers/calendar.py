import datetime
import json
import os
import tempfile
from typing import Dict, List

import icalendar
from dateutil import parser
from fastapi import BackgroundTasks
from fastapi.responses import FileResponse
from pytz import timezone, utc


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


def convert_to_gcal(events_json: json) -> List[Dict]:
    """
    Converts a list of events in JSON format into a Google Calendar-compatible format.

    Args:
        events_json (List[Dict]): List of event dictionaries with the following keys:
            - summary: Event title
            - dt_start: Event start time in "YYYY-MM-DD HH:MM:SS" format
            - dt_end: Event end time in "YYYY-MM-DD HH:MM:SS" format
            - location: Event location (nullable)
            - description: Event description (nullable)
            - misc_info: Additional information (nullable)

    Returns:
        List[Dict]: List of dictionaries formatted for Google Calendar API.
    """
    gcal_events = []

    for event in events_json:
        try:
            # Parse datetime strings
            start_time = datetime.datetime.strptime(event["dt_start"], "%Y-%m-%d %H:%M:%S")
            end_time = datetime.datetime.strptime(event["dt_end"], "%Y-%m-%d %H:%M:%S")

            # Create Google Calendar event
            gcal_event = {
                "summary": event["summary"],
                "description": (event["description"] + "\n\n" if event.get("description") else "")
                + (event.get("misc_info") or ""),
                "location": event["location"] or "",
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": "America/Toronto",  # Adjust the time zone if needed
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": "America/Toronto",  # Adjust the time zone if needed
                },
            }

            gcal_events.append(gcal_event)

        except Exception as e:
            print(f"Error processing event: {event}, Error: {e}")

    return gcal_events


def convert_to_utc(datetime_str, time_zone="America/Toronto"):
    """
    Converts a datetime string with a provided timezone to UTC
    and appends 'Z' to indicate UTC.
    """
    # Parse the datetime string
    dt = parser.isoparse(datetime_str)

    # Ensure the datetime is naive before applying the timezone
    if dt.tzinfo is None:
        # Localize with the provided timezone
        tz = timezone(time_zone)
        dt = tz.localize(dt)
    elif dt.tzinfo is not None:
        raise ValueError("The datetime string already contains timezone information.")

    # Convert to UTC
    dt_utc = dt.astimezone(utc)

    # Format as ISO 8601 and replace UTC offset with 'Z'
    return dt_utc.isoformat().replace("+00:00", "Z")
