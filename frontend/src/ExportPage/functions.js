import { handleSignOut } from 'Login/functions';

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
        handleFileDeleteAll(localFiles, fileLinks, setFileLinks, setLocalFiles);

        return { ok: ret.length > 0, data: ret };
    } catch (err) {
        console.error("Upload failed:", err);
        throw err;
    }
}

async function uploadLocalFiles(localFiles, formData) {
    localFiles.forEach((file) => {
        formData.append("files", file.file);
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

function handleFileDeleteAll(localFiles, fileLinks, setFileLinks, setLocalFiles) {
    localFiles.forEach(({ file, previewUrl }, index) => {
        URL.revokeObjectURL(previewUrl);
    });
    fileLinks.forEach((file_id) => {
        URL.revokeObjectURL(`https://drive.google.com/file/d/${file_id}/preview?usp=drive_web`);
    });
    setFileLinks(new Set());
    setLocalFiles([]);
}

export async function handleExportClick(e, selectedBox, setError, setScreen, fileLinks, localFiles, setFileLinks, setLocalFiles, setResults, setLoginType) {
    if (!selectedBox) {
        setError("Please select an export method");
        return;
    }

    if (selectedBox === "Google Calendar") {
        const res = await fetch("http://localhost:8000/oauth/google/check_scopes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!res.ok) {
            throw new Error("Failed to check Google scopes");
        }

        const hasAccess = await res.json();
        if (!hasAccess.has_scopes) {
            handleSignOut(() => { });
            setLoginType("google");
            return { ok: false, reason: "calendar" };
        }

        const res2 = await uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles);
        if (res2.ok) {
            setResults(res2.data);
        } else {
            setError(`Failed to upload files ${res2}`)
            setScreen("error");
        }

        const cal_res = await fetch("http://localhost:8000/google/export/gcal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(res.data),
        });

        console.log(cal_res)

        if (cal_res.ok) {
            setScreen("results");
        } else {
            setError("Failed to export to Google Calendar");
            setScreen("error");
            return { ok: false, reason: "gcal" };
        }
    }

    // const res = await uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles);
    // if (res.ok) {
    //     setResults(res.data);
    // }

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
    // setScreen('processing');
    // const res = await uploadFiles(fileLinks, localFiles, setFileLinks, setLocalFiles);
    // if (res.ok) {
    //     setResults(res.data);
    //     setScreen('results');
    // } else {
    //     setScreen('error');
    // }
}