import { MdClose } from "react-icons/md";

export default function FilePreview({
	fileLinks,
	localFiles,
	handleURLDelete,
	handleFileDelete,
}) {
	return (
		<>
			<div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
				{[...fileLinks].map((file_id, i) => {
					return (
						<div className="position-relative d-flex">
							<iframe
								key={i}
								id={`embed-${i}`} // Unique ID for each iframe
								title={`embed-${i}`} // Unique title for accessibility
								className="my-3"
								width="300"
								height="424"
								src={`https://drive.google.com/file/d/${file_id}/preview?usp=drive_web`} // Corrected src attribute
								frameBorder="0"
								allowFullScreen // Optional: allows fullscreen capability
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
								key={index}
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
