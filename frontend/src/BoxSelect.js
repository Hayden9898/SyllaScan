import { useState } from 'react';
import './css/App.css';
import './css/SelectableRow.css'

const SelectableBoxRow = () => {
  const [selectedBoxes, setSelectedBoxes] = useState(new Set());

  const handleBoxClick = (info) => {
    setSelectedBoxes((prevSelectedBoxes) => {
      const newSelectedBoxes = new Set(prevSelectedBoxes);
      if (prevSelectedBoxes.has(info.description)) {
        newSelectedBoxes.delete(info.description);
      } else {
        newSelectedBoxes.add(info.description);
      }
      return newSelectedBoxes;
    });
  };

  // Array to hold the data for each box
  const boxInfo = [
    { description: 'Google Calendar', bgColor: '#ff9999', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png' },
    { description: 'Notion', bgColor: '#99ff99', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png' },
    { description: 'iCal', bgColor: '#9999ff', imageUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678116-calendar-512.png' },
    { description: 'Google Sheets', bgColor: '#ffcc99', imageUrl: 'https://cdn-icons-png.flaticon.com/256/2965/2965327.png' },
  ];

  return (
    <div className="box-row" style={{ display: 'flex', gap: '40px' }}>
      {boxInfo.map((info, index) => (
        <div
          key={index}
          className={`box ${selectedBoxes.has(info.description) ? 'selected' : ''}`}
          onClick={() => handleBoxClick(info)}
          style={{
            backgroundColor: info.bgColor,
            padding: '20px',
            border: selectedBoxes.has(info.description) ? '3px solid black' : '1px solid #ccc',
            cursor: 'pointer',
          }}
        >
          <h3>{info.title}</h3>
          <img src={info.imageUrl} alt={info.title} style={{ width: '100px', height: '100px' }} />
          <p className="description">{info.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SelectableBoxRow;