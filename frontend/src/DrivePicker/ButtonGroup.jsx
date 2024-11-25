import React, { useEffect } from "react";
import useDrivePicker from "react-google-drive-picker";

import Button from "components/Button";
import Label from "components/Label";

export default function ButtonGroup({
	setLocalFiles,
	authToken,
	setFileLinks,
	fileLinks,
	setAuthToken,
	className,
}) {
	const [openPicker, authRes] = useDrivePicker();
	useEffect(() => {
		if (authRes) {
			setAuthToken(authRes.access_token);
		}
	}, [authRes, setAuthToken]);

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
			token: authToken,
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

			<div>
				<div className="upload-but">
					<Button
						className="btn btn-info bg-white text-black gap-1 items-center flex flex-nowrap"
						onClick={handleOpenPicker}
					>
						<img
							className="padded-logo"
							src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
							alt="google drive"
						/>
						Upload from Google Drive
					</Button>
				</div>
			</div>
		</div>
	);
}
