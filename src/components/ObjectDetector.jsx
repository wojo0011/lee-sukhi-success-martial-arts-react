import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const ObjectDetector = () => {
  const [isSink, setIsSink] = useState(false);
  const [isCooktop, setIsCooktop] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading status
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load the COCO-SSD model once when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      } finally {
        setLoading(false); // Model loading complete
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && model) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          drawImageOnCanvas(img);
          detectObjects(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.value = null; // Reset the file input
      fileInputRef.current.click();
    }
  };

  const drawImageOnCanvas = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const canvasWidth = canvas.clientWidth;
    const scaleFactor = canvasWidth / image.width;
    const canvasHeight = image.height * scaleFactor;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    setImageUploaded(true);
  };

  const detectObjects = async (image) => {
    if (!model) {
      console.error('Model not loaded yet');
      return;
    }

    const canvas = canvasRef.current;
    const predictions = await model.detect(canvas);

    // Check if any detected object is a "sinks"
    const foundSink = predictions.some(
      (prediction) =>
        prediction.class.toLowerCase() === 'sink' &&
        prediction.score > 0.1 // Confidence threshold
    );

    // Check if any detected object is a "sinks"
    const foundCooktop = predictions.some(
      (prediction) =>
        prediction.class.toLowerCase() === 'cook-top' &&
        prediction.score > 0.1 // Confidence threshold
    );

    setIsSink(foundSink);
    setIsCooktop(foundCooktop);

    // Draw bounding boxes around detected objects
    drawBoundingBoxes(predictions);
  };

  const drawBoundingBoxes = (predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      const isSink = prediction.class.toLowerCase() === 'sink';
      const isCooktop = prediction.class.toLowerCase() === 'cook-top';
      ctx.strokeStyle = isSink || isCooktop ? 'green' : 'red'; // Use green for sinks
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
  
      ctx.fillStyle = isSink ? 'green' : 'red';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
        x,
        y > 10 ? y - 5 : 10
      );
  
    });
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <h1>Object Detector</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
        disabled={loading} // Disable input during model loading
      />
      <div
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          maxWidth: '80%',
          aspectRatio: '16 / 9',
          border: '2px dashed #aaa',
          margin: '20px auto',
          cursor: loading ? 'not-allowed' : 'pointer', // Change cursor based on loading state
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            fontSize: '18px',
            color: '#666',
            zIndex: 10,
          }}
        >
          {loading ? 'Loading model, please wait...' : 'Click to Upload Image'}
        </div>
        {imageUploaded && !loading && (
          <>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              color: 'green',
              fontSize: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '5px',
            }}
          >
            Cooktop Detected:{' '}
            <span style={{ color: 'blue' }}>{isCooktop ? 'true' : 'false'}</span>
          </div>
         

         <div
         style={{
           position: 'absolute',
           bottom: '10px',
           left: '10px',
           color: 'green',
           fontSize: '16px',
           backgroundColor: 'rgba(255, 255, 255, 0.8)',
           padding: '5px',
         }}
       >
         Sink Detected:{' '}
         <span style={{ color: 'blue' }}>{isSink ? 'true' : 'false'}</span>
       </div>
       </>
        )}
      </div>
    </div>
  );
};

export default ObjectDetector;
