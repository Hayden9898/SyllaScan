import { MdClose } from "react-icons/md";
import { handleFileDelete, handleURLDelete } from "./functions";
import { useEffect, useState } from "react";

export default function FilePreview({
	fileLinks,
	localFiles,
	setFileLinks,
	setLocalFiles,
}) {
	const [fileUrls, setFileUrls] = useState([]);
	useEffect(() => {
		const assignFileURLs = () => {
			const urls = localFiles.map((file) => URL.createObjectURL(file.content));
			setFileUrls(urls);
		};

		assignFileURLs();

		// Cleanup URLs when component unmounts or localFiles change
		return () => {
			fileUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [localFiles]);

	return (
		<>
			<div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
				{[...fileLinks].map((file_id, i) => {
					return (
						<div
							className="position-relative d-flex"
							key={`${file_id}_${i}`}
						>
							<iframe
								key={file_id + "_" + i}
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
									onClick={() =>
										handleURLDelete(file_id, setFileLinks)
									}
								>
									<MdClose />
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<div className="d-flex flex-row gap-2 mx-2 overflow-x-auto">
				{fileUrls.map((fileURL, index) => (
					<div
						className="position-relative d-flex"
						key={index + "_file"}
					>
						<div className="position-relative d-flex">
							<iframe
								key={fileURL + "_" + index}
								title={fileURL}
								src={fileURL}
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
									handleFileDelete(
										localFiles[index],
										setLocalFiles
									)
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
