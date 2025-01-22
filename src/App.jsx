
import './App.css'
import PerMonthInput from "./components/PerMonthInput";
import ImageProcessor from "./components/ImageProcessor";
import ObjectDetector from "./components/ObjectDetector";

function App() {
  const accessCamera = (() => {
    
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      const videoElement = document.querySelector('video');
      videoElement.srcObject = stream;
    })
    .catch((err) => {
      switch (err.name) {
        case 'NotFoundError':
          alert('No camera device found. Please connect a camera and try again.');
          break;
        case 'NotAllowedError':
          alert('Camera access denied. Please allow access to the camera.');
          break;
        case 'OverconstrainedError':
          alert('No camera matches the specified constraints.');
          break;
        case 'NotReadableError':
          alert('Camera is already in use by another application.');
          break;
        default:
          console.error('Error accessing camera:', err);
      }
    });
  

  });


  return (
    <>

      {/* <PerMonthInput /> */}
      {/* <ImageProcessor /> */}
      <ObjectDetector />
    </>
  )
}

export default App
