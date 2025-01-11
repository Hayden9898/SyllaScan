import Button from "components/Button";
import { convertToCalendar, downloadCalendar } from "../functions";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

import "css/Calendar.css";
import { useEffect, useState } from "react";

export default function DefaultCal({ results }) {
	const [calendarEvents, setCalendarEvents] = useState([]);
	useEffect(() => {
		convertToCalendar(results, setCalendarEvents);
	}, [results]);

	return (
		<>
			<div id="results" className="w-[70%] mt-4">
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin]}
					initialView="dayGridMonth"
					headerToolbar={{
						left: "prev,next today",
						center: "title",
						right: "dayGridMonth,timeGridWeek,timeGridDay",
					}}
					events={calendarEvents}
					eventClick={(info) => {
						alert(
							`Event: ${info.event.title}\n${info.event.extendedProps.description}`
						);
						// TODO: Make this into a modal popup
					}}
				/>
			</div>
			<Button onClick={() => downloadCalendar(results)}>
				Download Calendar
			</Button>
		</>
	);
}
