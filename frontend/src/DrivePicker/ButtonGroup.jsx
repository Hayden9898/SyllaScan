import React, { useEffect, useState } from "react";
import useDrivePicker from "react-google-drive-picker";

import Label from "components/Label";
import GoogleLogin from "Login/Google";

import { addFile } from "indexedDb";

export default function ButtonGroup({
	setLocalFiles,
	setFileLinks,
	fileLinks,
	className,
}) {
	const [openPicker] = useDrivePicker();
	const [token, setToken] = useState(null);

	useEffect(() => {
		const fetchToken = async () => {
			const response = await fetch(
				"http://localhost:8000/oauth/google/get_token",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			if (!response.ok) {
				console.error("Failed to fetch token");
				return;
			}
			console.log(response)
			const data = await response.json();
			setToken(data.access_token);
		};
		fetchToken();
	}, []);

	function handleFileUpload(event) {
		const fileInput = event.target;
		const files = Array.from(event.target.files);

		if (files.length === 0) return;

		files.forEach(async (file) => {
			const res = await addFile(file);
			if (!res) {
				console.error("Failed to add file to database");
				return
			}

			const fileData = {
				id: res,
				name: file.name,
				type: file.type,
				size: file.size,
				lastModified: file.lastModified,
				lastModifiedDate: file.lastModifiedDate,
				content: file,
			}

			setLocalFiles((prevFiles) => [...prevFiles, fileData]);
		});

		fileInput.value = "";
	}

	const handleOpenPicker = () => {
		openPicker({
			clientId: process.env.REACT_APP_CLIENT_ID,
			developerKey: process.env.REACT_APP_API_KEY,
			token: token,
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
					multiple
					style={{ display: "none" }}
					onChange={handleFileUpload}
				/>
			</div>

			<div className="upload-but">
				<GoogleLogin
					redirect={"/upload"}
					callback={handleOpenPicker}
					text={"Google Drive"}
				/>
			</div>
		</div>
	);
}
