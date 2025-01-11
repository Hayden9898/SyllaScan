import { useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import Loader from 'components/Loader';
import DrivePicker from 'DrivePicker/DrivePicker';
import ExportPage from 'ExportPage/page';
import Home from 'Home/page';
import Nav from 'Nav';
import Results from 'Results/page';

import 'css/App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [fileLinks, setFileLinks] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [results, setResults] = useState(null);

  const Layout = ({ children }) => {
    return (
      <>
        <Nav setScreen={setScreen} />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <Nav setScreen={setScreen} />
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
