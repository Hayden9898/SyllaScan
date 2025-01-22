import { deleteAllFiles } from 'indexedDb';
import { login } from 'Login/functions';

export async function uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles) {
    const formData = new FormData();
    let ret = [];

    if ((!fileLinks || fileLinks.size === 0) && (!localFiles || localFiles.length === 0)) {
        throw new Error("No files to upload");
    }

    try {
        // Fetch files from links and append to formData
        if (fileLinks && fileLinks.length > 0) {
            const res = await fetchFiles(Array.from(fileLinks));
            ret = res.response;
        }

        // Append local files and upload
        if (localFiles && localFiles.length > 0) {
            const res = await uploadLocalFiles(localFiles, formData);
            ret = ret.concat(res.response);
        }

        // Cleanup and reset state
        if (ret.length > 0) await
            handleFileDeleteAll(setFileLinks, setLocalFiles);

        return { ok: ret.length > 0, data: ret };
    } catch (err) {
        console.error("Upload failed:", err);
        throw err;
    }
}

async function uploadLocalFiles(localFiles, formData) {
    localFiles.forEach((file) => {
        formData.append("files", file.content);
    });

    const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload local files");
    }

    return await response.json();
}

async function fetchFiles(fileLinks) {
    if (!fileLinks || fileLinks.length === 0) {
        throw new Error("fileLinks must be a non-empty array");
    }

    const response = await fetch("http://localhost:8000/google/get_files", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(fileLinks),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch files from links");
    }

    return await response.json();
}

export async function handleFileDeleteAll(setFileLinks, setLocalFiles) {
    await deleteAllFiles();
    setFileLinks(new Set());
    setLocalFiles([]);
}

export async function handleExportClick(e, selectedBox, setError, fileLinks, localFiles, setFileLinks, setLocalFiles, setResults, navigate) {
    if (!selectedBox) {
        setError("Please select a platform to export to");
        return;
    }

    if (selectedBox === "Calendar File") {
        const fileData = await uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles);
        if (fileData.ok) {
            setResults(fileData.data);
            navigate("/results");
        } else {
            navigate("/error?reason=upload");
            return;
        }
    }

    if (selectedBox === "Outlook") {
        setError("Outlook export not yet supported");
        return;
    }

    if (selectedBox === "Google Calendar") {
        const res = await login("/export");

        navigate("/processing");

        if (res) {
            const fileData = await uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles);
            if (fileData.ok) {
                setResults(fileData.data);
            } else {
                navigate("/error?reason=upload");
                return;
            }

            const cal_res = await fetch("http://localhost:8000/google/export/gcal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(fileData.data),
            });

            if (cal_res.ok) {
                const calendarId = await cal_res.json();
                setResults(calendarId.calendar_id);
                navigate("/results/google");
            } else {
                navigate("/error?reason=gcal");
                return;
            }
        }
    }

    if (selectedBox === "Notion") {
        setError("Notion export not yet supported");
        return;
    }
    if (selectedBox === "iCal") {
        setError("iCal export not yet supported");
        return;
    }
    if (selectedBox === "Google Sheets") {
        setError("Google Sheets export not yet supported");
        return;
    }
}