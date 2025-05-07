import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import imageCompression from 'browser-image-compression';
import './modal.css';
import { getData } from '../redux/FileSlice';

const FileUploadModal = ({ isOpen, onClose, sem }) => {
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
    maxSize: 4000000,
    maxFiles: 3,
  });
  
const upscaleImage = async (file, targetKB) => {
  setStatus(`Upscaling ${file.name}...`);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        let scale = 1;
        let blob;
        
        if (file.size / 1024 >= targetKB) {
          resolve(file);
          return;
        }
        
        for (let i = 0; i < 8; i++) {
          scale += 0.25;
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          
          ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          const kernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0];
          
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              let r = 0, g = 0, b = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                  const weight = kernel[(ky + 1) * 3 + (kx + 1)];
                  r += data[idx] * weight;
                  g += data[idx + 1] * weight;
                  b += data[idx + 2] * weight;
                }
              }
              const idx = (y * canvas.width + x) * 4;
              data[idx] = Math.min(Math.max(r, 0), 255);
              data[idx + 1] = Math.min(Math.max(g, 0), 255);
              data[idx + 2] = Math.min(Math.max(b, 0), 255);
            }
          }
          ctx.putImageData(imageData, 0, 0);

          blob = await new Promise(resolveBlob => canvas.toBlob(resolveBlob, file.type, 0.9));
          
          if (blob.size / 1024 >= targetKB) break;
          
          if (blob.size / 1024 >= targetKB * 1.5) {
            blob = await imageCompression(blob, {
              maxSizeMB: targetKB / 1024,
              useWebWorker: true,
            });
            break;
          }
        }
        resolve(blob || file);
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
      const MAX_TOTAL_MB = 4;
      const fileCount = files.length;
      
      const targetKBPerFile = Math.floor(MAX_TOTAL_MB * 1024 / fileCount);
      
      setStatus('Upscaling images...');
      const upscaledFiles = await Promise.all(
        files.map(file => upscaleImage(file, targetKBPerFile))
      );

      setStatus('Validating and compressing...');
      const totalSizeMB = upscaledFiles.reduce((acc, file) => acc + file.size / 1024 / 1024, 0);
      console.log(`Total size after upscaling: ${totalSizeMB.toFixed(2)}MB`);
      
      let processedFiles = upscaledFiles;
      if (totalSizeMB > MAX_TOTAL_MB) {
        setStatus('Further optimizing images...');
        const compressionTargetMB = MAX_TOTAL_MB / fileCount;
        processedFiles = await Promise.all(
          upscaledFiles.map(async (file, index) => 
            imageCompression(file, {
              maxSizeMB: compressionTargetMB,
              useWebWorker: true,
              initialQuality: 0.8,
              fileType: files[index].type,
            })
          )
        );
      }

      const finalSizeMB = processedFiles.reduce((acc, file) => acc + file.size / 1024 / 1024, 0);
      console.log(`Final total size: ${finalSizeMB.toFixed(2)}MB`);
      
      if (finalSizeMB > MAX_TOTAL_MB + 0.1) {
        throw new Error(`Total size ${finalSizeMB.toFixed(1)}MB exceeds ${MAX_TOTAL_MB}MB limit`);
      }

      setStatus('Uploading to server...');
      const formData = new FormData();
      processedFiles.forEach((file, index) => {
        const fileName = files[index].name;
        console.log(`Adding file: ${fileName}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        formData.append('files', file, fileName);
      });
      
      await dispatch(getData({formData: formData, sem: sem})).unwrap();

      setStatus('Processing with AI...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setFiles([]);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
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
            <div className={`step ${status.includes('optimizing') || status.includes('compressing') || status.includes('Validating') ? 'active' : ''}`}>
              <span>📦</span> Optimizing
            </div>
            <div className={`step ${status.includes('Uploading') && 'active'}`}>
              <span>☁️</span> Uploading
            </div>
            <div className={`step ${status.includes('AI') || status.includes('Processing') ? 'active' : ''}`}>
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