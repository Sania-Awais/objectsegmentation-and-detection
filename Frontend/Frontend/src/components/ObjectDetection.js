import React from 'react';
import './ObjectDetection.css';

const ObjectDetection = () => {
  return (
    <div className="object-detection-container">
      <h2>Object Recognition</h2>
      <div className="detection-output">
        <p>Objects</p>
        <ol>
          <li>Object 1 at Location</li>
          <li>Object 2 at Location</li>
          <li>Object 3 at Location</li>
          <li>Object 4 at Location</li>
        </ol>
      </div>
    </div>
  );
};

export default ObjectDetection;
