import { useState } from 'react';

import DrivePicker from './DrivePicker/DrivePicker';
import Nav from './Nav';
import SelectableBoxRow from './DrivePicker/BoxSelect';

import { uploadFiles } from './ExportPage/functions';

import './css/App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [fileLinks, setFileLinks] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [results, setResults] = useState(null);
  return (
    <>
      <Nav />
      {
        screen === 'home' &&
        <>
          <div className='wrapper-container'>
            <div className="about-container" style={{ width: 500 }}>
              <div className="text-container">
                <div className="title">Syllabus Scanner</div>
                <i><div className="slogan-text">"Conquering Procrastination, one deadline at a time."</div></i>
                <p className="about-text" >
                  The purpose of this application is to make scheduling important events in a student's course syllabus to ensure you never miss an important
                  assignment, quiz, test, mid-term, or any important class event. We also strive to give you constant reminders to start studying for tests
                  or complete assignments early, so you are always prepared.
                </p>
              </div>
            </div>
          </div>
          {/*implement about us*/}
          <button onClick={() => { setScreen('drive') }}>Continue to App</button>
        </>
      }
      {
        screen === 'drive' &&
        <DrivePicker
          fileLinks={fileLinks}
          setFileLinks={setFileLinks}
          localFiles={localFiles}
          setLocalFiles={setLocalFiles}
          authToken={authToken}
          setAuthToken={setAuthToken}
          setScreen={setScreen}
        />
      }
      {
        screen === 'export' &&

        <>
          <h1 style={{ textAlign: "center" }}>
            Select a platform to export to
          </h1>
          <SelectableBoxRow />
          <div className="cloud-button-container">
            <button
              className="upload-cloud-but"
              onClick={async () => {
                const res = await uploadFiles(fileLinks, localFiles, authToken, setFileLinks, setLocalFiles);
                console.log(res);
                setResults(res.data);
                if (res.ok) {
                  setScreen('results');
                }
              }}>
              <img
                alt="cloud"
                className="padded-logo-cloud"
                src="https://cdn.icon-icons.com/icons2/3214/PNG/512/cloud_file_upload_server_icon_196427.png"
              />
              Upload
            </button>
          </div>
        </>
      }
      {
        screen === 'results' &&
        <div>
          <h1>Results</h1>
          <div>
            {results}
          </div>
        </div>
      }
    </>
  );
}

export default App;
