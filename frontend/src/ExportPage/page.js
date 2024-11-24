import SelectableBoxRow from "../DrivePicker/BoxSelect";
import { uploadFiles } from "./functions";
export default function ExportPage({ fileLinks, setFileLinks, localFiles, setLocalFiles, authToken, setResults, setScreen }) {
    return (
        <>
            <h1 style={{ textAlign: "center" }}>
                Select a platform to export to
            </h1>
            <SelectableBoxRow />
            <div className="cloud-button-container">
                <button
                    className="upload-cloud-but"
                    onClick={async () => {
                        setScreen('processing');
                        const res = await uploadFiles(fileLinks, localFiles, authToken, setFileLinks, setLocalFiles);
                        console.log(res);
                        if (res.ok) {
                            setResults(res.data);
                            setScreen('results');
                        } else {
                            setScreen('error');
                        }
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