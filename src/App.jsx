import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PerMonthInput from "./components/PerMonthInput";
import ImageProcessor from "./components/ImageProcessor";

function App() {
  const [count, setCount] = useState(0);

  
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() =>accessCamera()}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <input type="file" id="imageUpload" accept="image/*" />
    <canvas id="canvasOutput"></canvas>

      <PerMonthInput />
      <ImageProcessor />

    </>
  )
}

export default App
