from msgraph import GraphServiceClient
from msgraph.generated.models.calendar import Calendar

from fastapi import APIRouter, HTTPException, Request
from helpers.calendar import convert_to_gcal
from helpers.outlook import get_events, event_conflicting

router = APIRouter()

@app.route("/oauth/login")
def call_downstream_api():
    token = auth.get_token_for_user(app_config.SCOPE)
    if "error" in token:
        return redirect(url_for("login"))
    # Use access token to call downstream api
    api_result = requests.get(
        app_config.ENDPOINT,
        headers={'Authorization': 'Bearer ' + token['access_token']},
        timeout=30,
    ).json()
    return render_template('display.html', result=api_result)


@router.post("/export/outlook")
async def export_to_gcal(request: Request) -> dict:
    # TODO: attach a bearer token to the request
    data = await request.json()

    has_scopes = oauth.check_scopes(request)

    if not has_scopes:
        raise HTTPException(
            status_code=403,
            detail="Microsoft OAuth token does not have the required scopes",
        )

    result = await graph_client.me.calendars.get()

    created_calendar = None

    for calendar in calendars.get("value", []):
        if calendar.get("name") == "SyllaScan Calendar": # Check if the calendar already exists
            created_calendar = calendar

    if not created_calendar: # Create a new calendar if it doesn't exist
        request_body = Calendar(
            name = "SyllaScan Calendar",
        )

        created_calendar = await graph_client.me.calendars.post(request_body)

    data = convert_to_gcal(data)

    for event in data:
        events = get_events(created_calendar["id"], event["start"], event["end"])
        if not event_conflicting(events, event):
            request_body = Event(
                subject = event["summary"],
                body = ItemBody(
                    content_type = BodyType.text,
                    content = event["description"],
                ),
                start = DateTimeTimeZone(
                    date_time = event["start"]["dateTime"],
                    time_zone = event["start"]["timeZone"],
                ),
                end = DateTimeTimeZone(
                    date_time = event["end"]["dateTime"],
                    time_zone = event["end"]["timeZone"],
                ),
                transaction_id = "7E163156-7762-4BEB-A1C6-729EA81755A7",
            )

            request_configuration = RequestConfiguration()
            request_configuration.headers.add("Prefer", "outlook.timezone=\"Eastern Standard Time\"")

            created_event = await graph_client.me.events.post(request_body, request_configuration = request_configuration)

            print(f"Event created: {created_event['htmlLink']}")

    return {
        "calendar_id": created_calendar["id"],
        "ok": True,
    }
