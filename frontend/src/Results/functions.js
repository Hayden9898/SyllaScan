export const downloadCalendar = async (results) => {
    try {
        const response = await fetch("http://localhost:8000/download_calendar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(results), // Assuming 'results' is your JSON payload
        });

        if (response.ok) {
            const blob = await response.blob();
            console.log(blob)
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "calendar.ics";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            console.error("Failed to fetch results");
        }
    } catch (error) {
        console.error("Error fetching calendar:", error);
    }
};

export const convertToCalendar = (results, setCalendarEvents) => {
    setCalendarEvents(results.map((result) => {
        let description = "";
        if (result["description"]) {
            description += result["description"];
        }
        if (result["location"]) {
            description += "\n" + result["location"];
        }
        if (result["misc_info"]) {
            description += "\n" + result["misc_info"];
        }
        return {
            title: result["summary"],
            date: result["dt_start"],
            description: description
        };
    }));
}