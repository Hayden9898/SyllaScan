import "css/App.css";
import "css/SelectableRow.css";

const SelectableBoxRow = ({ selectedBox, setSelectedBox }) => {
	const handleBoxClick = (info) => {
		setSelectedBox(info.description);
	};

	// Array to hold the data for each box
	const boxInfo = [
		{
			description: "Calendar File",
			bgColor: "#99ff99",
			imageUrl:
				"https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg",
		},
		{
			description: "Outlook",
			bgColor: "#ffcc99",
			imageUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7e/Outlook_icon.svg",
		},
		{
			description: "Google Calendar",
			bgColor: "#ff9999",
			imageUrl:
				"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png",
		},
		{
			description: "Notion",
			bgColor: "#99ff99",
			imageUrl:
				"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png",
		},
		{
			description: "iCal",
			bgColor: "#9999ff",
			imageUrl:
				"https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678116-calendar-512.png",
		},
		{
			description: "Google Sheets",
			bgColor: "#ffcc99",
			imageUrl: "https://cdn-icons-png.flaticon.com/256/2965/2965327.png",
		},
	];

	return (
		<div className="box-row" style={{ display: "flex", gap: "40px" }}>
			{boxInfo.map((info, index) => (
				<div
					key={index}
					className={`box ${
						selectedBox === info.description ? "selected" : ""
					}`}
					onClick={() => handleBoxClick(info)}
					style={{
						backgroundColor: info.bgColor,
						padding: "20px",
						border:
							selectedBox === info.description
								? "3px solid black"
								: "1px solid #ccc",
						cursor: "pointer",
					}}
				>
					<h3>{info.title}</h3>
					<img
						src={info.imageUrl}
						alt={info.title}
						style={{ width: "100px", height: "100px" }}
					/>
					<p className="description">{info.description}</p>
				</div>
			))}
		</div>
	);
};

export default SelectableBoxRow;
