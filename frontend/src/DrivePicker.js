import useDrivePicker from 'react-google-drive-picker';

function handleFileUpload(event) {
    // Get the file name from the input
    const fileName = event.target.files[0]?.name || "No file selected";

    // Display the file name in the span
    document.getElementById("upload-filename").innerText = fileName;
    document.getElementById("upload-filename").classList.remove("d-none");

    // Upload the file
    uploadFile(event.target.files[0]);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
export default function DrivePicker() {
    const [openPicker] = useDrivePicker();

    const handleOpenPicker = () => {
        openPicker({
            clientId: process.env.REACT_APP_CLIENT_ID,
            developerKey: process.env.REACT_APP_API_KEY,
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            callbackFunction: (data) => {
                if (data.action === 'cancel') {
                    console.log('User clicked cancel/close button')
                }
                console.log(data)
                if (data.action === 'picked') {
                    const document = data.docs[0];
                    const fileId = document.id;
                    window.document.getElementById("embed").src =
                        data.docs[0].embedUrl;

                    fetch("http://localhost:8000/get_file", {
                        method: "POST",
                        headers: {
                            "Allow-Control-Allow-Origin": "*",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            fileId: fileId,
                        })
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        })
                }
            },
        })
    };

    return (
        <div className="d-flex flex-column justify-content-center">
            <div className="d-flex justify-content-center gap-4">
                <div className="d-flex flex-column m-0">
                    <label htmlFor="file-upload" className="btn btn-info bg-white text-black m-0 align-items-center h-100">
                        Local Upload
                        <p id="upload-filename" className="d-none"></p>
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                    />
                </div>
                <button className="btn btn-info bg-white text-black gap-1 align-items-center" onClick={handleOpenPicker}>
                    <img
                        src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
                        alt="google drive"
                        width="30"
                    />
                    Upload from Google Drive
                </button>
            </div>
            <embed src="" id="embed" width="500" height="500" />
        </div>
    );
}