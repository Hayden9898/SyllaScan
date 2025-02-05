from msgraph import GraphServiceClient
from msgraph.generated.users.item.events.events_request_builder import EventsRequestBuilder
from kiota_abstractions.base_request_configuration import RequestConfiguration

from helpers.calendar import check_overlapping


def get_events(calendar_id, start_time, end_time):
    temp_end = end_time
    dt = datetime.strptime(temp_end["dateTime"], "%Y-%m-%dT%H:%M:%S")
    if start_time["dateTime"] == temp_end["dateTime"]:
        dt += timedelta(minutes=1)
        temp_end["dateTime"] = datetime.strftime(dt, "%Y-%m-%dT%H:%M:%S")

    query_params = EventsRequestBuilder.EventsRequestBuilderGetQueryParameters(
            select = ["subject","body","bodyPreview","organizer","attendees","start","end","location"],
            filter= f"id e {calendar_id} and start/dateTime ge {start_time['dateTime']} and end/dateTime le {temp_end['dateTime']}",
    )

    request_configuration = RequestConfiguration(
        query_parameters = query_params,
    )
    request_configuration.headers.add("Authorization", "Bearer " + token)
    request_configuration.headers.add("Prefer", "outlook.timezone=\"Eastern Standard Time\"")


    result = await graph_client.me.events.get(request_configuration = request_configuration)

    return result


def event_conflicting(events, event):
    for i in range(len(events)):
        if check_overlapping(events[i], event):
            if events[i]["name"] == event["name"]:
                return True
    return False
