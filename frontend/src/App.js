import useDrivePicker from 'react-google-drive-picker';

import { FaLinkedin, FaGithub } from 'react-icons/fa';
import './css/App.css';

function handleFileUpload(event) {
  // Get the file name from the input
  const fileName = event.target.files[0]?.name || "No file selected";

  // Display the file name in the span
  document.getElementById("upload-filename").innerText = fileName;
  document.getElementById("upload-filename").classList.remove("d-none");

  // Upload the file
  uploadFile(event.target.files[0]);
}

function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function App() {
  const [openPicker] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId: process.env.REACT_APP_CLIENT_ID,
      developerKey: process.env.REACT_APP_API_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data)
        if (data.action === 'picked') {
          const document = data.docs[0];
          const fileId = document.id;
          // const res = await gapi.client.drive.files.get({
          //   fileId: fileId,
          //   fields: "id",
          //   alt: "media",
          // });
          window.document.getElementById("embed").src =
            data.docs[0].embedUrl;
          // console.log(res)
          // console.log(`URL: ${JSON.stringify(data)}`);
          // uploadFile(res);
        }
        console.log(data)
      },
    })
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Navbar</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor02">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Home
                  <span className="visually-hidden">(current)</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Pricing</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">About</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                  <a className="dropdown-item" href="#">Something else here</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">Separated link</a>
                </div>
              </li>
            </ul>
            <form className="d-flex">

              <a className="logoCol" href="https://github.com/Hayden9898" target="_blank" rel="noopener noreferer noreferrer">
                <FaGithub size={36} />
              </a>
              <a className="logoCol" href="https://www.linkedin.com/in/hayden-choi9/" target="_blank" rel="noopener noreferer noreferrer">
                <FaLinkedin size={36} />
              </a>
              <input className="form-control me-sm-2" type="search" placeholder="Search" />
              <button className="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
            </form>
          </div>
        </div>
      </nav>
      <div className="container" style={{ width: 500 }}>
        <h1>Title of projects</h1>
        <p style={{ textAlign: "center" }} >
          The purpose of this application is to make scheduling important school
          events much easier for students by just uploading a pdf and the rest is
          handled and your calendar is updated
        </p>
      </div>
      <div className="d-flex flex-column justify-content-center">
        <div className="d-flex justify-content-center gap-4">
          <div className="d-flex flex-column m-0">
            <label htmlFor="file-upload" className="btn btn-info bg-white text-black m-0 align-items-center h-100">
              Local Upload
              <p id="upload-filename" className="d-none"></p>
            </label>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e)}
            />
          </div>
          <button className="btn btn-info bg-white text-black gap-1 align-items-center" onClick={handleOpenPicker}>
            <img
              src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
              alt="google drive"
              width="30"
            />
            Upload from Google Drive
          </button>
        </div>
        <embed src="" id="embed" width="500" height="500" />
      </div>
    </>
  );
}

export default App;
