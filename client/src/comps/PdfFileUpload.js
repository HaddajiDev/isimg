import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import './modal.css';
import { getData, getDataPdf } from '../redux/FileSlice';

const PdfFileUpload = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    if (acceptedFiles.length > 1) {
      return setError('Only one PDF file is allowed');
    }
    const file = acceptedFiles[0];
    if (!file.type.match(/application\/pdf/)) {
      return setError('Invalid file type. Only PDF allowed');
    }
    setFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false, 
    minSize: 0,
    maxSize: 10000000 / 2,
    maxFiles: 1,
  });

  const handleUpload = async () => {
    setIsLoading(true);
    setError('');
    try {
      setStatus('Uploading to cloud...');
      const formData = new FormData();
      formData.append('file', file);

      await dispatch(getDataPdf(formData)).unwrap();

      setStatus('AI analysis...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setFile(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setIsLoading(false);
    setStatus('');
  };

  const _onClose = () => {
    onClose();
    setFile(null);
    setStatus('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {isLoading && (
        <div className="processing-overlay">
          <div className="spinner-container-1">
            <div className="spinner-1">
              <div className="spinner-inner-1"></div>
            </div>
          </div>
          <div className="processing-steps">
            <div className={`step ${status.includes('Uploading') && 'active'}`}>
              <span>☁️</span> Uploading
            </div>
            <div className={`step ${status.includes('AI') && 'active'}`}>
              <span>🤖</span> AI Analysis
            </div>
          </div>
          <div className="processing-status">{status}</div>
        </div>
      )}

      <div className="modal">
        <div className="modal-header">
          <h2>Upload PDF</h2>
          <button onClick={_onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <h3 style={{ marginBottom: "10px" }}>100% Accuracy</h3>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${error ? 'error' : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="preview-grid">
                <div className="preview-item">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="drop-content">
                  <div className="upload-icon">📤</div>
                  {isDragActive ? (
                    <p>Drop the PDF here</p>
                  ) : (
                    <>
                      <p>Drag & drop a PDF or</p>
                      <p className="secondary-text"></p>
                      <button className="browse-btn">Browse Files</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button onClick={_onClose} className="cancel-btn">Cancel</button>
            <button
              onClick={handleUpload}
              className="upload-btn"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <div className="button-loading">
                  <div className="spinner-inner"></div>
                  {status}
                </div>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfFileUpload;