import React, { useState, useRef } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Upload, X, FileText, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { readAndParseMultipleFiles, validateData } from '../utils/dataParser';

export default function UploadPage() {
  const { uploadedFiles, addFiles, removeFile, clearFiles, setCurrentPage } = useAnalysis();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.name.endsWith('.dat') || f.name.endsWith('.txt')
    );
    
    if (files.length === 0) {
      setError('Please drop .dat or .txt files only');
      return;
    }
    
    await processFiles(files);
  };
  
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };
  
  const processFiles = async (files) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedFiles = await readAndParseMultipleFiles(files);
      
      // 유효성 검사
      const invalidFiles = [];
      parsedFiles.forEach(file => {
        const validation = validateData(file);
        if (!validation.isValid) {
          invalidFiles.push({ name: file.filename, errors: validation.errors });
        }
      });
      
      if (invalidFiles.length > 0) {
        setError(`${invalidFiles.length} file(s) failed validation. Check console for details.`);
        console.error('Invalid files:', invalidFiles);
      }
      
      addFiles(parsedFiles.filter(f => validateData(f).isValid));
    } catch (err) {
      setError(`Failed to read files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContinue = () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one file');
      return;
    }
    setCurrentPage('parameters');
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 style={styles.title}>Step 1/5: Upload Data Files</h2>
      </div>
      
      <div style={styles.content}>
        {/* Drop Zone */}
        <div
          style={{
            ...styles.dropZone,
            ...(isDragging ? styles.dropZoneDragging : {})
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} color="#CBD5E0" />
          <p style={styles.dropText}>
            Drag & Drop .dat files here
          </p>
          <p style={styles.dropSubtext}>or click to browse</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".dat,.txt"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
        
        {/* Loading */}
        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading files...</p>
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div style={styles.error}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div style={styles.fileList}>
            <div style={styles.fileListHeader}>
              <h3>Uploaded Files ({uploadedFiles.length})</h3>
              <button style={styles.clearButton} onClick={clearFiles}>
                Clear All
              </button>
            </div>
            
            <div style={styles.files}>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} style={styles.fileItem}>
                  <FileText size={20} color="#4F46E5" />
                  <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{file.filename}</div>
                    <div style={styles.fileDetails}>
                      Position: {file.position !== null ? `${file.position} cm` : 'N/A'} | 
                      {' '}{file.dataPoints} points
                    </div>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeFile(file.filename)}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <button
          style={{
            ...styles.continueButton,
            ...(uploadedFiles.length === 0 ? styles.continueButtonDisabled : {})
          }}
          onClick={handleContinue}
          disabled={uploadedFiles.length === 0}
        >
          <span>Continue to Parameters</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7FAFC',
    padding: '2rem'
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#4A5568'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1A202C'
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  dropZone: {
    backgroundColor: 'white',
    border: '3px dashed #CBD5E0',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  dropZoneDragging: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  dropText: {
    fontSize: '1.125rem',
    color: '#4A5568',
    marginTop: '1rem',
    fontWeight: '600'
  },
  dropSubtext: {
    fontSize: '0.875rem',
    color: '#A0AEC0',
    marginTop: '0.5rem'
  },
  loading: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginTop: '1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E2E8F0',
    borderTopColor: '#4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    backgroundColor: '#FEE',
    color: '#C53030',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  fileList: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1rem'
  },
  fileListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E2E8F0'
  },
  clearButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#FEE',
    color: '#C53030',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  files: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#F7FAFC',
    borderRadius: '8px',
    transition: 'background-color 0.2s'
  },
  fileInfo: {
    flex: 1
  },
  fileName: {
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '0.25rem'
  },
  fileDetails: {
    fontSize: '0.875rem',
    color: '#718096'
  },
  removeButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#A0AEC0',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  continueButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '2rem'
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E0',
    cursor: 'not-allowed'
  }
};