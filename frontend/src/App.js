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
  const [fileLinks, setFileLinks] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [results, setResults] = useState(null);

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
              setResults={setResults} />
          } />
          <Route path="processing" element={<Loader message={"Please wait while we process your results"} />} />
          <Route path="results" element={<Results results={results} />} />
          {/* <Route path="*" element={<NoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
