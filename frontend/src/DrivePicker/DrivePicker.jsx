import { useEffect, useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import SelectableBoxRow from "./BoxSelect.js";
import ButtonGroup from "./ButtonGroup.jsx";
import "../css/DrivePicker.css";
import "../css/LoadingScreen.css";
import FilePreview from "./FilePreview.jsx";
import Loader from "./Loader.js";
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

		const newFiles = files.map((file) => ({
			file,
			previewUrl: URL.createObjectURL(file),
		}));

		setLocalFiles((prevFiles) => {
			const existingFileNames = new Set(
				prevFiles.map((f) => f.file.name)
			);
			const filteredFiles = newFiles.filter(
				(newFile) => !existingFileNames.has(newFile.file.name)
			);
			return [...prevFiles, ...filteredFiles];
		});

		fileInput.value = "";
	}

	function handleURLDelete(url) {
		setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
	}

	function handleFileDelete(file) {
		URL.revokeObjectURL(file.previewUrl); // Revoke URL to free memory
		setLocalFiles((prevFiles) =>
			prevFiles.filter((f) => f.file.name !== file.file.name)
		);
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
		return (
			<Loader message={message} />
		);
	}
	return (
		<>
			<div className="d-flex flex-column justify-content-center">
				<ButtonGroup
					handleFileUpload={handleFileUpload}
					handleOpenPicker={handleOpenPicker}
				/>
				<FilePreview
					fileLinks={fileLinks}
					localFiles={localFiles}
					handleURLDelete={handleURLDelete}
					handleFileDelete={handleFileDelete}
				/>
			</div>
			{(fileLinks.size > 0 || localFiles.length > 0) && (
				<div className="continue-button-container">
					<button
						className="continue-button-but"
						onClick={() => setShowExportOptions(true)}
					>
						<span>
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
						<button
							className="upload-cloud-but"
							onClick={uploadFiles}
						>
							<img
								alt="cloud"
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
