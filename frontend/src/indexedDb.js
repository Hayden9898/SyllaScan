export async function deleteAllFiles() {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");

        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function deleteFile(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");

        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function getFileById(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");

        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function getAllFiles() {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function addFile(file) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");

        const fileData = {
            id: file.name,
            name: file.name,
            type: file.type,
            size: file.size,
            content: file,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
        };

        const request = store.add(fileData);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("FileStorageDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}
