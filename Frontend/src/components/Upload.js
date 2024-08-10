import React, { useRef, useState } from 'react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [segmentationResult, setSegmentationResult] = useState(null);
  const [imageError, setImageError] = useState(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setImageError('Please select an image file.');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Only JPG and PNG images are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = async () => {
    const file = fileInputRef.current.files[0];

    if (!file) {
      setImageError('Please select an image file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // POST request to the /segment/ endpoint
      const response = await axios.post('http://127.0.0.1:5000/segment/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Process the response data
      const { segmentation, detections } = response.data;
      
      // Convert segmentation result to base64 for image display
      const segmentationBase64 = btoa(
        new Uint8Array(segmentation).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      setDetectionResult({
        objects: detections,
        image: `data:image/jpeg;base64,${segmentationBase64}`
      });

      // Convert segmentation result to base64 for image display
      const segmentationBase64Image = btoa(
        new Uint8Array(segmentation).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      setSegmentationResult({
        results: detections, // You might need to adjust this if segmentation results are different
        image: `data:image/png;base64,${segmentationBase64Image}`
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      setImageError('An error occurred during upload. Please try again.');
    }
  };

  const handleCancelClick = () => {
    setImagePreview(null);
    setDetectionResult(null);
    setSegmentationResult(null);
    setImageError(null);
  };

  return (
    <div className="upload-container">
      <h2>Upload files</h2>
      <div className="upload-box">
        <div className="upload-icon"></div>
        <p>Drop files here</p>
        <p>Supported format: PNG, JPG</p>
        <p>OR</p>
        <button className="browse-button" onClick={handleBrowseClick}>
          Browse files
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          onChange={handleFileChange}
          multiple={false}
          style={{ display: 'none' }}  // Hide the file input
        />
      </div>
      <div className="upload-actions">
        <button className="cancel-button" onClick={handleCancelClick}>
          Cancel
        </button>
        <button className="upload-button" onClick={handleUploadClick}>
          Upload
        </button>
      </div>

      {imagePreview && (
        <div>
          <h3>Image Preview</h3>
          <img src={imagePreview} alt="Preview of uploaded image" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
      {detectionResult && (
        <div>
          <h3>Detection Result</h3>
          <img src={detectionResult.image} alt="Detection result" style={{ maxWidth: '100%', height: 'auto' }} />
          <ul>
            {detectionResult.objects.map((obj, index) => (
              <li key={index}>
                {obj.label}: {obj.confidence.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {segmentationResult && (
        <div>
          <h3>Segmentation Result</h3>
          <img src={segmentationResult.image} alt="Segmentation result" style={{ maxWidth: '100%', height: 'auto' }} />
          <ul>
            {segmentationResult.results.map((result, index) => (
              <li key={index}>
                {result.label}: {result.confidence.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {imageError && <p className="error-message">{imageError}</p>}
    </div>
  );
};

export default Upload;
