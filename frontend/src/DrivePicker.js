import useDrivePicker from "react-google-drive-picker";
import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import SelectableBoxRow from "./BoxSelect.js";
import "./css/DrivePicker.css";
import "./css/LoadingScreen.css"

// TODO: Add ability to upload multiple files

export default function DrivePicker() {
    const [fileLinks, setFileLinks] = useState(new Set());
    const [localFiles, setLocalFiles] = useState([]);
    const [authToken, setAuthToken] = useState(null);
    const [openPicker, authRes] = useDrivePicker();
    const [showExportOptions, setShowExportOptions] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("picker");
  const [message, setMessage] = useState("Processing Files...");

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
        setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
    }

  function handleFileDelete(file) {
    URL.revokeObjectURL(file.previewUrl); // Revoke URL to free memory
    setLocalFiles((prevFiles) => prevFiles.filter(f => f.file.name !== file.file.name));
  }

    function handleFileDeleteAll() {
        setFileLinks(new Set());
        setLocalFiles([]);
        setShowExportOptions(true);
    }

    async function uploadFiles() {
        const formData = new FormData();
        const paramLinks = Array.from(fileLinks);

        setShowExportOptions(false);

        try {
            const res = await fetch("http://localhost:8000/get_files", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileLinks: paramLinks,
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to get file");
            }
            const data = await res.json();
            console.log(data);

            const files = data.files;
            files.forEach((file) => {
                formData.append("files", file.file);
            });
        } catch (error) {
            console.error("Error:", error);
        }

        // Append local files to form data
        localFiles.forEach((file) => {
            formData.append("files", file.file);
        });

        try {
            const res = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                throw new Error("Failed to upload files");
            }
            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.error("Error:", error);
        }

        setShowExportOptions(false);
        handleFileDeleteAll();
      setCurrentScreen("processing");
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
            multiselect: true,
            callbackFunction: (data) => {
                if (data.action === "cancel") {
                    console.log("User clicked cancel/close button");
                }
                console.log(data);
                if (data.action === "picked") {
                    const document = data.docs[0];
                    const fileId = document.id;
                    setFileLinks([...fileLinks, fileId]);
                }
            },
        });
    };

  useEffect(() => {
    if (currentScreen === "processing") {
      // Define the sequence of messages
      const messages = ["Processing Files...", "Scanning Documents...", "Finalizing..."];
      let index = 0;

      // Set up intervals to change the message every 2 seconds (2000 ms)
      const interval = setInterval(() => {
        index += 1;
        if (index < messages.length) {
          setMessage(messages[index]);
        } else {
          clearInterval(interval); // Clear the interval once the sequence is complete
        }
      }, 5000);
      return () => clearInterval(interval); 
    }
  }, [currentScreen]);


  if (currentScreen === "processing") {
    return (
      <>
        <div class="center-components">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          <h1 class="processing-title">{message}</h1>
        </div>
      </>
    );
  }
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
            [...fileLinks].map((file_id, i) => {
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
            </div>
            <div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
                {localFiles.map(({ file, previewUrl }, index) => (
                    <div className='position-relative d-flex' key={file.name}>
                        <div className="position-relative d-flex">
                            <iframe
                                key={index}
                                title={file.name}
                                src={previewUrl}
                                width="300"
                                height="424"
                                frameBorder="0"
                                style={{ margin: "10px" }}
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
                        <div className="position-absolute ">
                            <button
                                className="btn btn-danger"
                                onClick={() => handleFileDelete(localFiles[index])}
                            >
                                <MdClose />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

          {(fileLinks.size > 0 || localFiles.length > 0) && (
              <div className="continue-button-container">
                  <button
                      className="continue-button-but"
                      onClick={() => setShowExportOptions(true)}
                  >
                      <span>
                          {" "}
                          Continue
                          <MdOutlineArrowCircleRight className="continue-right-arrow" />
                      </span>
                  </button>
              </div>
          )}
          {showExportOptions && (
              <>
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
                              src="https://cdn.icon-icons.com/icons2/3214/PNG/512/cloud_file_upload_server_icon_196427.png"
                          />
                          Upload
                      </button>
                  </div>
              </>
          )}
        </>
    );
}
