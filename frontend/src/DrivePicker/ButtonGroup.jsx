import React from "react";
import useDrivePicker from "react-google-drive-picker";

import Label from "components/Label";
import GoogleLogin from "Login/Google";

export default function ButtonGroup({
	setLocalFiles,
	setFileLinks,
	fileLinks,
	className,
}) {
	const [openPicker] = useDrivePicker();

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

	const handleOpenPicker = () => {
		openPicker({
			clientId: process.env.REACT_APP_CLIENT_ID,
			developerKey: process.env.REACT_APP_API_KEY,
			// token: authToken,
			viewId: "DOCS",
			showUploadView: true,
			showUploadFolders: true,
			supportDrives: true,
			multiselect: true,
			callbackFunction: (data) => {
				if (data.action === "cancel") {
					console.warn("User clicked cancel/close button");
				}
				if (data.action === "picked") {
					const document = data.docs[0];
					const fileId = document.id;
					setFileLinks([...fileLinks, fileId]);
				}
			},
		});
	};

	return (
		<div className={`button-group ${className}`}>
			<div className="flex flex-nowrap">
				<div className="upload-but">
					<Label
						htmlFor="file-upload"
						className="btn btn-info bg-white text-black flex flex-nowrap justify-center items-center"
					>
						<img
							className="padded-logo"
							src="https://cdn-icons-png.flaticon.com/512/2810/2810455.png"
							alt="upload"
						/>
						Local Upload
						<p id="upload-filename" className="d-none"></p>
					</Label>
				</div>
				<input
					accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/docx, .docx, .xlsx, .xls, .pdf, .doc, .txt, .rtf, .xml"
					type="file"
					id="file-upload"
					style={{ display: "none" }}
					onChange={handleFileUpload}
				/>
			</div>

			<div className="upload-but">
				<GoogleLogin
					callback={handleOpenPicker}
				/>
			</div>
		</div>
	);
}
