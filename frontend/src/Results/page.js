import { useEffect } from "react"

export default function Results({ results, setScreen }) {
    useEffect(() => {
        const downloadCalendar = async () => {
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

        downloadCalendar();
    }, []);

    return (
        <div>
            <h1>Results</h1>
            <div id="results">
                {JSON.stringify(results, null, 2)}
            </div>
        </div>
    )
}