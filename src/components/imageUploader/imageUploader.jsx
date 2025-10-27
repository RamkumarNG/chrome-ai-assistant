import { useState } from "react";

const ImageUploader = ({ selectedImage, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    selectedImage ? URL.createObjectURL(selectedImage) : null
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div
      className={`image-upload-box ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {!previewUrl ? (
        <label className="upload-placeholder">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden-input"
          />
          <div className="upload-content">
            <span className="upload-icon">📷</span>
            <p>Drag & drop or click to upload an image</p>
          </div>
        </label>
      ) : (
        <div className="preview-container">
          <img src={previewUrl} alt="Preview" className="preview-image" />
          <button type="button" className="remove-btn" onClick={handleRemove}>
            ✖
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
