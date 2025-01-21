export default function GCalResults({ calendarId }) {

	return (
		<div className="flex flex-col items-center">
			<div id="results" className="w-[70%] mt-20">
                <iframe
                    title="Google Calendar"
                    src={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=America%2FToronto`}
                    style={{border: 0}}
					width="800"
					height="600"
					frameborder="0"
					scrolling="no"
				></iframe>
			</div>
		</div>
	);
}
