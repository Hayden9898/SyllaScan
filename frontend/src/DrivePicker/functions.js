import { deleteFile, addFile } from "indexedDb";

export function handleURLDelete(url, setFileLinks) {
    setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
}

export function handleFileDelete(file, setLocalFiles) {
    deleteFile(file.id);
    setLocalFiles((prevFiles) =>
        prevFiles.filter((f) => f.id !== file.id)
    );
}

export function handleFileUpload(event, setLocalFiles) {
    event.preventDefault();

    let files = [];
    const fileInput = event.target;

    if (event.dataTransfer)
        files = Array.from(event.dataTransfer.files);
    else
        files = Array.from(event.target.files);

    if (!files || files.length === 0) return;

    files.forEach(async (file) => {
        const res = await addFile(file);
        if (!res) {
            console.error("Failed to add file to database");
            return
        }

        const fileData = {
            id: res,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            content: file,
        }

        setLocalFiles((prevFiles) => [...prevFiles, fileData]);
    });

    fileInput.value = "";
}