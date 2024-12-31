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

export const convertToCalendar = (results) => {
    results.forEach(element => {
        element.title = element["summary"];
        element.date = element["dt_start"].split(" ")[0];
        let description = "";
        if (element["description"]) {
            description += element["description"];
        }
        if (element["location"]) {
            description += "\n" + element["location"];
        }
        if (element["misc_info"]) {
            description += "\n" + element["misc_info"];
        }
        element.description = description;
    });
}