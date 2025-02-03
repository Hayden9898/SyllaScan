import { useState, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Nav from 'Nav';

import DrivePicker from 'DrivePicker/page';
import ExportPage from 'ExportPage/page';
import Home from 'Home/page';
import Results from 'Results/page';
import Loader from 'components/Loader';

import DefaultCal from 'Results/components/DefaultCal';
import GCalResults from 'Results/components/GCal';

import { getAllFiles } from 'indexedDb';
import 'css/App.css';

function App() {
  const [fileLinks, setFileLinks] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const ScrollToHashElement = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [location]);
    return null;
  };

  useEffect(() => {
    const getFiles = async () => {
      setLoading(true);
      const files = await getAllFiles();
      if (files.length !== localFiles.length) {
        setLocalFiles(files);
      }
      setLoading(false);
    };
    getFiles();
  }, [localFiles, setResults, setLocalFiles]);

  const Layout = ({ children }) => {
    return (
      <>
        <Nav />
        <Outlet />
      </>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToHashElement />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="upload" element={
            <DrivePicker
              fileLinks={fileLinks}
              setFileLinks={setFileLinks}
              localFiles={localFiles}
              setLocalFiles={setLocalFiles} />
          } />
          <Route path="export" element={
            <ExportPage
              fileLinks={fileLinks}
              setFileLinks={setFileLinks}
              localFiles={localFiles}
              setLocalFiles={setLocalFiles}
              results={results}
              setResults={setResults}
              loading={loading}
            />
          } />
          <Route path="processing" element={<div className='w-screen h-screen bg-black items-center content-center'><Loader message={"Please wait while we process your results"} /></div>} />
          <Route path="error" element={<Loader message={"An error occurred while processing your request"} />} />
          <Route path="/results" element={<Results results={results} />}>
            <Route index element={<DefaultCal results={results} />} />
            <Route path="/results/google" element={<GCalResults calendarId={results} />} />
          </Route>
          {/* <Route path="*" element={<NoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
