function handleURLDelete(url, setFileLinks) {
    setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
}

function handleFileDelete(file, setLocalFiles) {
    URL.revokeObjectURL(file.previewUrl); // Revoke URL to free memory
    setLocalFiles((prevFiles) =>
        prevFiles.filter((f) => f.file.name !== file.file.name)
    );
}