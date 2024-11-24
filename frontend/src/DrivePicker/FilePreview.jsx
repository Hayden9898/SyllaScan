import { MdClose } from "react-icons/md";

export default function FilePreview({
	fileLinks,
	localFiles,
	setFileLinks,
	setLocalFiles,
}) {
	function handleURLDelete(url) {
		setFileLinks((prevFiles) => prevFiles.filter((f) => f !== url));
	}

	function handleFileDelete(file) {
		URL.revokeObjectURL(file.previewUrl); // Revoke URL to free memory
		setLocalFiles((prevFiles) =>
			prevFiles.filter((f) => f.file.name !== file.file.name)
		);
	}

	return (
		<>
			<div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
				{[...fileLinks].map((file_id, i) => {
					return (
						<div className="position-relative d-flex" key={`${file_id}_${i}`}>
							<iframe
								key={file_id+ '_' + i}
								id={`embed-${i}`}
								title={`embed-${i}`}
								className="my-3"
								width="300"
								height="424"
								src={`https://drive.google.com/file/d/${file_id}/preview?usp=drive_web`}
								frameBorder="0"
								allowFullScreen
							></iframe>
							<div className="position-absolute">
								<button
									className="btn btn-danger"
									onClick={() => handleURLDelete(file_id)}
								>
									<MdClose />
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
				{localFiles.map(({ file, previewUrl }, index) => (
					<div className="position-relative d-flex" key={file.name}>
						<div className="position-relative d-flex">
							<iframe
								key={previewUrl + '_' + index}
								title={file.name}
								src={previewUrl}
								width="300"
								height="424"
								frameBorder="0"
								style={{ margin: "10px" }}
							></iframe>
						</div>
						<div className="position-absolute ">
							<button
								className="btn btn-danger"
								onClick={() =>
									handleFileDelete(localFiles[index])
								}
							>
								<MdClose />
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
