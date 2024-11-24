import { useEffect, useState } from "react";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import ButtonGroup from "./ButtonGroup.jsx";
import "../css/DrivePicker.css";
import FilePreview from "./FilePreview.jsx";
import Loader from "./Loader.js";

export default function DrivePicker({
	fileLinks,
	setFileLinks,
	localFiles,
	setLocalFiles,
	authToken,
	setAuthToken,
	setScreen,
}) {
	const [currentScreen, setCurrentScreen] = useState("picker");
	const [message, setMessage] = useState("Processing Files...");

	useEffect(() => {
		return () => {
			localFiles.forEach(({ file, previewUrl }, index) => {
				URL.revokeObjectURL(previewUrl);
			});
		};
	}, [localFiles]);

	useEffect(() => {
		if (currentScreen === "processing") {
			// Define the sequence of messages
			const messages = [
				"Processing Files...",
				"Scanning Documents...",
				"Finalizing...",
			];
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
		return <Loader message={message} />;
	}
	return (
		<>
			<div className="d-flex flex-column justify-content-center">
				<FilePreview
					fileLinks={fileLinks}
					localFiles={localFiles}
					setFileLinks={setFileLinks}
					setLocalFiles={setLocalFiles}
				/>
				<ButtonGroup
					setLocalFiles={setLocalFiles}
					authToken={authToken}
					setFileLinks={setFileLinks}
					fileLinks={fileLinks}
					setAuthToken={setAuthToken}
					setCurrentScreen={setCurrentScreen}
				/>
			</div>
			{(fileLinks.size > 0 || localFiles.length > 0) && (
				<div className="continue-button-container">
					<button
						className="continue-button-but"
						onClick={() => setScreen("export")}
					>
						<span>
							Continue
							<MdOutlineArrowCircleRight className="continue-right-arrow" />
						</span>
					</button>
				</div>
			)}
		</>
	);
}
