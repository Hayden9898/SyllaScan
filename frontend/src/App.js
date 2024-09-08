import DrivePicker from './DrivePicker';
import Nav from './Nav';
import './css/App.css';

function App() {
  return (
    <>
      <Nav />
      <div className="container" style={{ width: 500 }}>
        <h1>Title of projects</h1>
        <p style={{ textAlign: "center" }} >
          The purpose of this application is to make scheduling important school
          events much easier for students by just uploading a pdf and the rest is
          handled and your calendar is updated
        </p>
      </div>
      <DrivePicker />
    </>
  );
}

export default App;
