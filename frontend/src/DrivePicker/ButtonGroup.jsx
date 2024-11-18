export default function ButtonGroup({handleFileUpload, handleOpenPicker}) {
	return (
		<div className="button-group">
			<div>
				<div className="upload-but">
					<label
						htmlFor="file-upload"
						className="btn btn-info bg-white text-black m-0 align-items-center h-100"
					>
						<img
							className="padded-logo"
							src="https://cdn-icons-png.flaticon.com/512/2810/2810455.png"
							alt="upload"
						/>
						Local Upload
						<p id="upload-filename" className="d-none"></p>
					</label>
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
					<button
						className="btn btn-info bg-white text-black gap-1 align-items-center"
						onClick={handleOpenPicker}
					>
						<img
							className="padded-logo"
							src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
							alt="google drive"
						/>
						Upload from Google Drive
					</button>
				</div>
			</div>
		</div>
	);
}
