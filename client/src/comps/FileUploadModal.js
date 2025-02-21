import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './modal.css'
import { useDispatch, useSelector } from 'react-redux';
import { getData } from '../redux/FileSlice';

const FileUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      setError('Only JPG/PNG files up to 5MB are allowed');
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (!selectedFile.type.match(/image\/(jpeg|png)/)) {
      setError('Invalid file type. Please upload JPG or PNG.');
      return;
    }

    setFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {'image/*': ['.jpeg', '.jpg', '.png']},    
    multiple: false
  });

  const dispatch = useDispatch();
  const handleUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await dispatch(getData(formData)).unwrap();
      onClose();
      
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Upload Image</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div 
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${error ? 'error' : ''}`}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="preview-container">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="preview-image"
                />
                <p className="file-name">{file.name}</p>
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">📤</div>
                {isDragActive ? (
                  <p>Drop the image here</p>
                ) : (
                  <>
                    <p>Drag & drop an image here</p>
                    <p className="secondary-text">or</p>
                    <button className="browse-btn">Browse Files</button>
                  </>
                )}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="upload-btn"
              disabled={!file || isLoading}
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