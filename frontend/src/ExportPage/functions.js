export async function uploadFiles(fileLinks, localFiles, authToken, setFileLinks, setLocalFiles) {
    const formData = new FormData();
    let ret = null;

    if ((!fileLinks || fileLinks.size === 0) && (!localFiles || localFiles.length === 0)) {
        throw new Error("No files to upload");
    }

    try {
        // Fetch files from links and append to formData
        if (fileLinks && fileLinks.size > 0) {
            await fetchFiles(Array.from(fileLinks), authToken, formData);
        }

        // Append local files and upload
        if (localFiles && localFiles.length > 0) {
            ret = await uploadLocalFiles(localFiles, formData);
            if (!ret.ok) {
                throw new Error("Failed to upload local files");
            }
        }

        // Cleanup and reset state
        handleFileDeleteAll(localFiles, fileLinks, setFileLinks, setLocalFiles);

        return { ok: true, data: ret };
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

    const data = await response.json();
    return data;
}

async function fetchFiles(fileLinks, authToken, formData) {
    const fileLinksArray = Array.from(fileLinks);
    const response = await fetch("http://localhost:8000/get_files", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileLinksArray }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch files from links");
    }

    const { files } = await response.json();
    files.forEach((file) => {
        formData.append("files", file.file);
    });
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