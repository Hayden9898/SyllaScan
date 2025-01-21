import { deleteFile } from "indexedDb";

export function handleURLDelete(url, setFileLinks) {
    setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
}

export function handleFileDelete(file, setLocalFiles) {
    deleteFile(file.id);
    setLocalFiles((prevFiles) =>
        prevFiles.filter((f) => f.id !== file.id)
    );
}