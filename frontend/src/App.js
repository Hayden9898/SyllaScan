import { useState } from 'react';

import DrivePicker from './DrivePicker/DrivePicker';
import Loader from './DrivePicker/Loader';
import ExportPage from './ExportPage/page';
import Nav from './Nav';
import Results from './Results/page';
import Home from './Home/page'

import 'css/App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [fileLinks, setFileLinks] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [results, setResults] = useState(null);
  return (
    <>
      <Nav authToken={authToken} setAuthToken={setAuthToken} setScreen={setScreen} />
      {
        screen === 'home' &&
        <Home setScreen={setScreen} />
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
