import { useState } from "react";
import SelectableBoxRow from "./BoxSelect";
import { handleExportClick } from "./functions";

export default function ExportPage({ fileLinks, setFileLinks, localFiles, setLocalFiles, authToken, setResults, setScreen }) {
    const [selectedBox, setSelectedBox] = useState(null);
    const [error, setError] = useState(null);

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
                    onClick={(e) => handleExportClick(e, selectedBox, setError, setScreen, fileLinks, localFiles, authToken, setFileLinks, setLocalFiles, setResults)}>
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