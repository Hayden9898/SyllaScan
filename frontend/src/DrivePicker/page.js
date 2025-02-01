import { Link } from "react-router-dom";
import ButtonGroup from "./ButtonGroup.jsx";
import FilePreview from "./FilePreview.jsx";
import { handleFileUpload } from "./functions.js";

import "css/DrivePicker.css";
import "css/Drop.css";

export default function DrivePicker({
	fileLinks,
	setFileLinks,
	localFiles,
	setLocalFiles
}) {
	return (
		<div className="background drag-drop"
			onDrop={(e) => handleFileUpload(e, setLocalFiles)}
			onDragOver={(event) => event.preventDefault()}
		>
			<div className="flex flex-column justify-content-center">
				<div className="upload-file-label">
					<h1>
						Get Started: Upload your syllabus via Local or Google
						Drive!
					</h1>
					<p>Let us do the organizing for you</p>
				</div>
				<ButtonGroup
					setLocalFiles={setLocalFiles}
					setFileLinks={setFileLinks}
					fileLinks={fileLinks}
				/>
				<FilePreview
					fileLinks={fileLinks}
					localFiles={localFiles}
					setFileLinks={setFileLinks}
					setLocalFiles={setLocalFiles}
				/>
			</div>
			{(fileLinks.length > 0 || localFiles.length > 0) && (
				<div className="continue-button-container">
					<Link to="/export">
						<button
							style={{
								position: "relative",
								display: "inline-block",
								cursor: "pointer",
								outline: "none",
								border: 0,
								verticalAlign: "middle",
								textDecoration: "none",
								background: "transparent",
								padding: 0,
								fontSize: "inherit",
								fontFamily: "inherit",
							}}
							className="continue"
						>
							<span className="circle" aria-hidden="true">
								<span className="icon arrow"></span>
							</span>
							<span className="button-text">Continue</span>
						</button>
					</Link>
				</div>
			)}
		</div>
	);
}
