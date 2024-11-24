import { useState } from 'react';

import DrivePicker from './DrivePicker/DrivePicker';
import Nav from './Nav';
import ExportPage from './ExportPage/page';
import Results from './Results/page';
import Loader from './DrivePicker/Loader';

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
        <ExportPage
          fileLinks={fileLinks}
          setFileLinks={setFileLinks}
          localFiles={localFiles}
          setLocalFiles={setLocalFiles}
          authToken={authToken}
          setResults={setResults}
          setScreen={setScreen}
        />
      }
      {
        screen === 'processing' &&
        <Loader message={"Please wait for your results"} />
      }
      {
        screen === 'results' &&
        <Results
          results={results}
          setScreen={setScreen}
        />
      }
    </>
  );
}

export default App;
