import { useEffect, useState } from "react";
import SelectableBoxRow from "./BoxSelect";
import { handleExportClick } from "./functions";
import { useNavigate } from "react-router-dom";
import "../css/Export.css"


export default function ExportPage({ fileLinks, setFileLinks, localFiles, setLocalFiles, results, setResults, loading }) {
    const [selectedBox, setSelectedBox] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // If there are no files or results, redirect to the upload page
        if (!loading && (!fileLinks || fileLinks.size === 0) && (!localFiles || localFiles.length === 0) && !results) {
            console.log("No files or results, redirecting to upload page");
            navigate("/upload");
        }
    }, [fileLinks, localFiles, navigate, results, loading]);

    return (
        <>
            <div className="background-export">
                <h1 className="export-title">
                    Step 2: Select a platform to export to!
                </h1>
                {
                    error &&
                    <h2 className="text-center text-red-700">
                        {error}
                    </h2>
                }
                <SelectableBoxRow selectedBox={selectedBox} setSelectedBox={setSelectedBox} />
                <div className="spacer"></div>
                <div className="cloud-button-container">
                    <button
                        className="upload-cloud-but flex items-center content-center"
                        onClick={async (e) => {
                            handleExportClick(e, selectedBox, setError, fileLinks, localFiles, setFileLinks, setLocalFiles, setResults, navigate);
                        }}>
                        <img
                            alt="cloud"
                            className="padded-logo-cloud"
                            src={"/upload.png"}
                        />
                        Upload
                    </button>
                </div>
                
            </div>
        </>
    )
}