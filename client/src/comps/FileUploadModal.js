import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import imageCompression from 'browser-image-compression';
import './modal.css';
import { getData } from '../redux/FileSlice';

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    const validFiles = acceptedFiles.every((file) => file.type.match(/image\/(jpeg|png)/));
    if (!validFiles) return setError('Invalid file types. Only JPG/PNG allowed');
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: true,
    minSize: 0,
    maxSize: 2000000,
    maxFiles: 3,
  });

  const upscaleImage = async (file, targetKB) => {
    setStatus('Upscaling...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          let scale = 1;
          let blob;
          for (let i = 0; i < 10; i++) {
            scale += 0.2;
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            blob = await new Promise(resolveBlob => canvas.toBlob(resolveBlob, file.type, 1));
            if (blob.size / 1024 >= targetKB) break;
          }
          resolve(blob);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const targetTotalMB = 5;
      const fileCount = files.length;
      const upscaleTargets = { 1: 2500, 2: 2000, 3: 2000 };
      const compressTargetsMB = { 1: 1.5, 2: 1.5, 3: 1 };

      setStatus('Upscaling images...');
      const upscaledFiles = await Promise.all(
        files.map(file => upscaleImage(file, upscaleTargets[fileCount] || 1000))
      );

      setStatus('Compressing images...');
      const processedFiles = await Promise.all(
        upscaledFiles.map(async (file, index) => 
          imageCompression(file, {
            maxSizeMB: compressTargetsMB[fileCount] || 0.8,
            useWebWorker: true,
            initialQuality: 1,
            fileType: files[index].type,
          })
        )
      );

      setStatus('Validating size...');
      const totalSizeMB = processedFiles.reduce((acc, file) => acc + file.size / 1024 / 1024, 0);
      if (totalSizeMB > targetTotalMB) throw new Error(`Total size ${totalSizeMB.toFixed(1)}MB exceeds 5MB limit`);

      setStatus('Uploading to cloud...');
      const formData = new FormData();
      processedFiles.forEach((file, index) => formData.append('files', file, files[index].name));
      await dispatch(getData(formData)).unwrap();

      setStatus('AI analysis...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setFiles([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setIsLoading(false);
    setStatus('');
  };

  const _onClose = () => {
    onClose();
    setFiles([]);
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
            <div className={`step ${status.includes('Upscaling') && 'active'}`}>
              <span>🎨</span> Upscaling
            </div>
            <div className={`step ${status.includes('Compressing') && 'active'}`}>
              <span>📦</span> Compressing
            </div>
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
          <h2>Upload Image</h2>
          <button onClick={_onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <h3 style={{marginBottom: "10px"}}>65% Accuracy</h3>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${error ? 'error' : ''}`}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <div className="preview-grid">
                {files.map((file, index) => (
                  <div key={index} className="preview-item">
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="preview-image" />
                    <p className="file-name">{file.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>                
                <div className="drop-content">                
                  <div className="upload-icon">📤</div>
                  {isDragActive ? (
                    <>
                    <p>Drop the images here</p>
                    </>
                  ) : (
                    <>
                      <p>Drag & drop up to 3 images or</p>
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
              disabled={!files.length || isLoading}
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

export default FileUploadModal;