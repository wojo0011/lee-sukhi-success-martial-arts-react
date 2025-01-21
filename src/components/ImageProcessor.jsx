import React, { useEffect, useRef, useState } from "react";

const ImageProcessor = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [points, setPoints] = useState({ countertop: [], creditCard: [] });
  const [selectionType, setSelectionType] = useState(null); // 'countertop' or 'creditCard'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.cv) {
      cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV.js is ready to use.");
      };
    } else {
      console.error("Failed to load OpenCV.js.");
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions and draw the image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Scale canvas display for responsiveness
        canvas.style.width = "90%";
        canvas.style.height = "auto";

        setUploadedImage(img); // Save the image for further processing
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate scaling factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Scale mouse coordinates to match original canvas size
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleCanvasClick = (e) => {
    if (!selectionType) {
      alert("Please select 'Outline Countertop' or 'Outline Credit Card' first.");
      return;
    }

    const { x, y } = getMousePosition(e);

    setPoints((prevPoints) => {
      const updatedPoints = {
        ...prevPoints,
        [selectionType]: [...prevPoints[selectionType], { x, y }],
      };

      console.log("Updated points for", selectionType, updatedPoints[selectionType]); // Debug
      return updatedPoints;
    });
  };

  const handleMouseMove = (e) => {
    const { x, y } = getMousePosition(e);

    if (draggingPoint) {
      // Update the position of the dragging point
      setPoints((prevPoints) => {
        const updatedPoints = { ...prevPoints };
        updatedPoints[draggingPoint.type][draggingPoint.index] = { x, y };
        return updatedPoints;
      });
      return;
    }

    // Check for hover over points
    let foundPoint = null;

    Object.keys(points).forEach((type) => {
      points[type].forEach((point, index) => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if (distance < 10) {
          foundPoint = { type, index };
        }
      });
    });

    setHoveredPoint(foundPoint);
  };

  const handleMouseDown = () => {
    if (hoveredPoint) {
      setDraggingPoint(hoveredPoint);
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  const clearPoints = (type) => {
    setPoints((prevPoints) => ({
      ...prevPoints,
      [type]: [],
    }));
  };

  const drawPoints = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Clear canvas and redraw the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);
  
    // Draw points and lines for both countertop and credit card
    ["countertop", "creditCard"].forEach((type) => {
      const color = type === "countertop" ? "blue" : "green";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
  
      const pts = points[type];
      if (pts.length > 0) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach((point, i) => {
          ctx.lineTo(point.x, point.y);
  
          // Draw measurements between points
          if (i > 0) {
            const prevPoint = pts[i - 1];
            const distancePixels = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
            );
            const distanceInches = (distancePixels / 50).toFixed(2); // Example conversion factor
  
            // Display measurement text
            const midX = (point.x + prevPoint.x) / 2;
            const midY = (point.y + prevPoint.y) / 2;
            ctx.fillStyle = color; // Match text color to line color
            ctx.font = "bold 60px Arial"; // Bold and large text
            ctx.fillText(`${distanceInches} in`, midX, midY);
          }
        });
  
        // Close shape and show final measurement
        if (pts.length > 2) {
          ctx.lineTo(pts[0].x, pts[0].y);
          const lastPoint = pts[pts.length - 1];
          const firstPoint = pts[0];
          const distancePixels = Math.sqrt(
            Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
          );
          const distanceInches = (distancePixels / 50).toFixed(2); // Example conversion factor
  
          // Display measurement on the closing line
          const midX = (lastPoint.x + firstPoint.x) / 2;
          const midY = (lastPoint.y + firstPoint.y) / 2;
          ctx.fillStyle = color; // Match text color to line color
          ctx.font = "bold 60px Arial"; // Bold and large text
          ctx.fillText(`${distanceInches} in`, midX, midY);
        }
  
        ctx.stroke();
      }
  
      // Draw points
      pts.forEach((point, index) => {
        ctx.fillStyle =
          hoveredPoint && hoveredPoint.type === type && hoveredPoint.index === index
            ? "red"
            : color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Larger point size
        ctx.fill();
      });
    });
  };
  
  

  useEffect(() => {
    if (uploadedImage) {
      drawPoints();
    }
  }, [points, hoveredPoint]);

  return (
    <div>
      <h2>Image Upload and Processing</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div>
        <button onClick={() => setSelectionType("countertop")}>Outline Countertop</button>
        <button onClick={() => setSelectionType("creditCard")}>Outline Credit Card</button>
        <button onClick={() => clearPoints("countertop")}>Clear Countertop Points</button>
        <button onClick={() => clearPoints("creditCard")}>Clear Credit Card Points</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          marginTop: "10px",
          maxWidth: "90%",
          height: "auto",
          display: "block",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default ImageProcessor;
