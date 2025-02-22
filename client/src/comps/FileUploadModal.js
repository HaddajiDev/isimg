import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './modal.css'
import { useDispatch } from 'react-redux';
import { getData } from '../redux/FileSlice';
import imageCompression from 'browser-image-compression';

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
      setError('');
      const validFiles = acceptedFiles.every(file => 
          file.type.match(/image\/(jpeg|png)/)
      );
      if (!validFiles) {
          setError('Invalid file types. Only JPG/PNG allowed');
          return;
      }
      setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
      onDrop,
      accept: {'image/*': ['.jpeg', '.jpg', '.png']},
      multiple: true,
      minSize: 0,
      maxSize: 2000000,
      maxFiles: 3
  });

  const dispatch = useDispatch();

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(file =>
          imageCompression(file, { maxSizeMB: 1.5 })
        )
      );
      const formData = new FormData();
      compressedFiles.forEach(file => formData.append('files', file));
      await dispatch(getData(formData)).unwrap();
      setFiles([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setIsLoading(false);
  };

  const _onClose = () => {
    onClose();
    setFiles([]);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Upload Image</h2>
          <button onClick={_onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div 
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${error ? 'error' : ''}`}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <div className="preview-grid">
                {files.map((file, index) => (
                  <div key={index} className="preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <p className="file-name">{file.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">📤</div>
                {isDragActive ? (
                  <p>Drop the images here</p>
                ) : (
                  <>
                    <p>Drag & drop at least 3 images</p>
                    <p className="secondary-text">or</p>
                    <button className="browse-btn">Browse Files</button>
                  </>
                )}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button onClick={_onClose} className="cancel-btn">Cancel</button>
            <button 
              onClick={handleUpload}
              className="upload-btn"
              disabled={!files || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
