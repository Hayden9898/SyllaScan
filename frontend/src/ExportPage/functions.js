export async function uploadFiles(fileLinks, localFiles, authToken, setFileLinks, setLocalFiles) {
    const formData = new FormData();
    let ret = [];

    if ((!fileLinks || fileLinks.size === 0) && (!localFiles || localFiles.length === 0)) {
        throw new Error("No files to upload");
    }

    try {
        // Fetch files from links and append to formData
        if (fileLinks && fileLinks.length > 0) {
            const res = await fetchFiles(Array.from(fileLinks), authToken);
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

async function fetchFiles(fileLinks, authToken) {
    if (!fileLinks || fileLinks.length === 0) {
        throw new Error("fileLinks must be a non-empty array");
    }

    const response = await fetch("http://localhost:8000/get_files", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
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