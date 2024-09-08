import GooglePicker from "react-google-picker";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import './css/App.css';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const APP_ID = process.env.REACT_APP_APP_ID;

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

// document.getElementById("authorize_button").style.display = "flex";
// document.getElementById("load_button").style.display = "none";
// document.getElementById("signout_button").style.display = "none";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  //   gapi.load("client:picker", initializePicker);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializePicker() {
  //   await gapi.client.load(
  //     "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
  //   );
  //   pickerInited = true;
  //   maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  //   tokenClient = google.accounts.oauth2.initTokenClient({
  //     client_id: CLIENT_ID,
  //     scope: SCOPES,
  //     callback: "http://127.0.0.1:8000", // defined later
  //   });
  //   gisInited = true;
  //   maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (pickerInited && gisInited) {
    document.getElementById("authorize_button").style.display =
      "flex";
  }
}

/**
 *  Sign in the user upon button click.
 **/
function handleAuthClick() {
  tokenClient.callback = async (response) => {
    if (response.error !== undefined) {
      throw response;
    }
    accessToken = response.access_token;
    document.getElementById("signout_button").style.display =
      "flex";
    document.getElementById("load_button").style.display = "flex";
    document.getElementById("authorize_button").style.display =
      "none";

    await createPicker();
  };

  if (accessToken === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  //   if (accessToken) {
  //     document.getElementById("authorize_button").style.display =
  //       "flex";
  //     document.getElementById("signout_button").style.display =
  //       "none";
  //     document.getElementById("load_button").style.display = "none";
  //     google.accounts.oauth2.revoke(accessToken);
  //     accessToken = null;
  //   }
}

/**
 *  Create and render a Picker object for searching images.
 */
function createPicker(google, oauthToken) {
    const view = new google.picker.ViewGroup(google.picker.ViewId.DOCS)
      .addView(google.picker.ViewId.DOCUMENTS)
      .addView(google.picker.ViewId.PDFS);
    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(API_KEY)
      .setAppId(APP_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
}

/**
 * Displays the file details of the user's selection.
 * @param {object} data - Containers the user selection from the picker
 */
async function pickerCallback(data) {
    if (data.action === data.Action.PICKED) {
      const document = data[data.Response.DOCUMENTS][0];
      const fileId = document[data.Document.ID];
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
}

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
          <GooglePicker client_id={CLIENT_ID}
            developerKey={API_KEY}
            scope={SCOPES}
            onChange={data => { console.log('on change:', data); pickerCallback(data) }}
            onAuthenticate={token => console.log('oauth token:', token)}
            onAuthFailed={data => console.log('on auth failed:', data)}
            multiselect={true}
            navHidden={true}
            authImmediate={false}
            viewId={'DOCS'}
            createPicker={(google, oauthToken) => createPicker(google, oauthToken)}
          >
            <button className="btn btn-info bg-white text-black gap-1 align-items-center">
              <img
                src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
                alt="google drive"
                width="30"
              />
              Upload from Google Drive
            </button>
          </GooglePicker>
          {/* <button
            id="authorize_button"
            className="btn btn-info bg-white text-black gap-1 align-items-center"
            onClick={handleAuthClick}
          >
            <img
              src="https://imgs.search.brave.com/oMwyxbNaJljh7kuYGRIsUmuNijirC2PBKnkVDDxGMPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rc3Rh/dGljLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9maWxlcy9kNTdi/MjQxMDZjMzRjN2U1/MGVmM2Q5ODQyM2I5/NGRkYWYzNWFkMmRh/NzNhOWI5ZDRkMTJm/NTJkYmI5ZGQ0YzA4/YzI5NTdmNjI1NWFi/ODY5MGQ1ZWYwYjMy/Y2ZmODI4N2UwOTU3/N2QwNWU0NzlkMjYz/ZTg3MjE2MGM0Yzll/ODM2Mw"
              alt="google drive"
              width="30"
            />
            Upload from Google Drive
          </button>
          <button
            id="signout_button"
            className="btn btn-info"
            onClick={handleSignoutClick}
          >
            Sign Out
          </button>
          <button id="load_button" className="btn btn-info" onClick={createPicker}>
            Load
          </button> */}
        </div>
        <embed src="" id="embed" width="500" height="500" />
      </div>
    </>
  );
}

export default App;
