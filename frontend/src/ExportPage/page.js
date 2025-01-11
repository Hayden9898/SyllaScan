import { useEffect, useState } from "react";
import SelectableBoxRow from "./BoxSelect";
import { handleExportClick } from "./functions";
import GoogleLogin from 'Login/Google';
import { useNavigate } from "react-router-dom";


export default function ExportPage({ fileLinks, setFileLinks, localFiles, setLocalFiles, results, setResults }) {
    const [selectedBox, setSelectedBox] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // If there are no files or results, redirect to the upload page
        if ((!fileLinks || fileLinks.size === 0) && (!localFiles || localFiles.length === 0) && !results) {
            navigate("/upload");
        }
    }, [fileLinks, localFiles, navigate, results]);

    return (
        <>
            <h1 className="text-center">
                Select a platform to export to
            </h1>
            <h2 className="text-center text-red-700">
                {error}
            </h2>
            <SelectableBoxRow selectedBox={selectedBox} setSelectedBox={setSelectedBox} />
            <div className="cloud-button-container">
                <button
                    className="upload-cloud-but flex items-center content-center"
                    onClick={async (e) => {
                        handleExportClick(e, selectedBox, setError, fileLinks, localFiles, setFileLinks, setLocalFiles, setResults, navigate);
                    }}>
                    <img
                        alt="cloud"
                        className="padded-logo-cloud"
                        src="https://cdn.icon-icons.com/icons2/3214/PNG/512/cloud_file_upload_server_icon_196427.png"
                    />
                    Upload
                </button>
            </div>
        </>
    )
}