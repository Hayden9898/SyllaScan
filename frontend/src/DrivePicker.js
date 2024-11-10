import useDrivePicker from 'react-google-drive-picker';
import { useState, useEffect } from 'react';
import { MdClose } from "react-icons/md";
import SelectableBoxRow from './BoxSelect.js';
import './css/DrivePicker.css';

// TODO: Add ability to upload multiple files

export default function DrivePicker() {
    const [files, setFiles] = useState(new Set());
    const [localFiles, setLocalFiles] = useState([]);
    const [authToken, setAuthToken] = useState(null);
    const [openPicker, authRes] = useDrivePicker();

    useEffect(() => {
        if (authRes) {
            setAuthToken(authRes.access_token);
        }
    }, [authRes]);

    useEffect(() => {
        return () => {
            localFiles.forEach(({ file, previewUrl }, index) => {
                URL.revokeObjectURL(previewUrl);
            });
        };
    }, [localFiles]);

    function handleFileUpload(event) {
        const fileInput = event.target;
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const newFiles = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setLocalFiles((prevFiles) => {
            const existingFileNames = new Set(prevFiles.map(f => f.file.name));
            const filteredFiles = newFiles.filter(newFile => !existingFileNames.has(newFile.file.name));
            return [...prevFiles, ...filteredFiles];
        });

        fileInput.value = "";
    }

    function handleURLDelete(url) {
        setFiles((prevFiles) => prevFiles.filter(f => f !== url));
    }

    function handleFileDelete(file) {
        URL.revokeObjectURL(file.previewUrl); // Revoke URL to free memory
        setLocalFiles((prevFiles) => prevFiles.filter(f => f.file.name !== file.file.name));
    }

    function handleFileDeleteAll() {
        setFiles(new Set());
        setLocalFiles([]);
    }

    function uploadFiles() {
        files.forEach((fileId) => {
            fetch("http://localhost:8000/get_file", {
                method: "POST",
                headers: {
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
                });
        });

        localFiles.forEach(({ file }) => {
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
        });

        handleFileDeleteAll();
    }

    const handleOpenPicker = () => {
        openPicker({
            clientId: process.env.REACT_APP_CLIENT_ID,
            developerKey: process.env.REACT_APP_API_KEY,
            token: authToken,
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            // multiselect: true,
            callbackFunction: (data) => {
                if (data.action === 'cancel') {
                    console.log('User clicked cancel/close button')
                }
                console.log(data)
                if (data.action === 'picked') {
                    const document = data.docs[0];
                    const fileId = document.id;
                    setFiles([...files, fileId]);

                    fetch("http://localhost:8000/get_file", {
                        method: "POST",
                        headers: {
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
        <>
            <div className="d-flex flex-column justify-content-center">
                <div className="button-group">
                    <div>
                        <div className="upload-but">
                            <label htmlFor="file-upload" className="btn btn-info bg-white text-black m-0 align-items-center h-100">
                                <img
                                    className="padded-logo"
                                    src="https://cdn-icons-png.flaticon.com/512/2810/2810455.png"
                                    alt="upload"
                                />
                                Local Upload
                                <p id="upload-filename" className="d-none"></p>
                            </label>
                        </div>
                        <input
                            accept='application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/docx, .docx, .xlsx, .xls, .pdf, .doc, .txt, .rtf, .xml'
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />

                    </div>

                    <div>
                        <div className="upload-but">
                            <button className="btn btn-info bg-white text-black gap-1 align-items-center" onClick={handleOpenPicker}>
                                <img
                                    className="padded-logo"
                                    src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
                                    alt="google drive"
                                />
                                Upload from Google Drive
                            </button>
                        </div>
                    </div>
                </div>
                <div className='d-flex flex-row gap-2 mx-2 overflow-x-auto'>
                    {
                        [...files].map((file_id, i) => {
                            return (
                                <div className='position-relative d-flex'>
                                    <iframe
                                        key={i}
                                        id={`embed-${i}`}  // Unique ID for each iframe
                                        title={`embed-${i}`}  // Unique title for accessibility
                                        className='my-3'
                                        width="300"
                                        height="424"
                                        src={`https://drive.google.com/file/d/${file_id}/preview?usp=drive_web`}  // Corrected src attribute
                                        frameBorder="0"
                                        allowFullScreen  // Optional: allows fullscreen capability
                                    >

                                    </iframe>
                                    <div className='position-absolute'>
                                        <button
                                            className='btn btn-danger'
                                            onClick={() => handleURLDelete(file_id)}
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
                <div className='d-flex flex-row gap-2 mx-2 overflow-x-auto'>
                    {localFiles.map(({ file, previewUrl }, index) => (
                        <div className='position-relative d-flex'>
                            <iframe
                                key={index}
                                title={file.name}
                                src={previewUrl}
                                width="300"
                                height="424"
                                frameBorder="0"
                                style={{ margin: '10px' }}
                            >
                            </iframe>
                            <div className='position-absolute '>
                                <button
                                    className='btn btn-danger'
                                    onClick={() => handleFileDelete(localFiles[index])}
                                >
                                    <MdClose />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <h1 style={{ textAlign: "center" }}>
                Select a platform to export to
            </h1>
            <div>
                <SelectableBoxRow />
            </div>
            <div className="cloud-button-container">
                <button className="upload-cloud-but" onClick={uploadFiles}>
                    <img alt='cloud'
                        className="padded-logo-cloud"
                        src='https://cdn.icon-icons.com/icons2/3214/PNG/512/cloud_file_upload_server_icon_196427.png'>
                    </img>
                    Upload
                </button>
            </div>
        </>
    );
}