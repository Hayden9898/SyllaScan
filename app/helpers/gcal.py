from datetime import datetime, timedelta
from helpers.calendar import convert_to_utc


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
