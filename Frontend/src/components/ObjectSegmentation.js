import React from 'react';
import './ObjectSegmentation.css';

const ObjectSegmentation = () => {
  return (
    <div className="object-segmentation-container">
      <h2>Object Segmentation</h2>
      <div className="segmentation-output">
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

export default ObjectSegmentation;
