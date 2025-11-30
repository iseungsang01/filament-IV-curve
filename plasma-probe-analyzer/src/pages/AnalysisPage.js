import React, { useEffect, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeMultipleFiles } from '../utils/mainAnalysis';

export default function AnalysisPage() {
  const {
    uploadedFiles,
    parameters,
    analysisStatus,
    updateAnalysisProgress,
    completeAnalysis,
    setCurrentPage
  } = useAnalysis();
  
  const [logs, setLogs] = useState([]);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    runAnalysis();
  }, []);
  
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };
  
  const runAnalysis = async () => {
    addLog('Starting analysis...', 'info');
    addLog(`Processing ${uploadedFiles.length} file(s)`, 'info');
    
    try {
      const results = await analyzeMultipleFiles(
        uploadedFiles,
        parameters,
        (fileIndex, totalFiles, filename) => {
          addLog(`Analyzing: ${filename} (${fileIndex + 1}/${totalFiles})`, 'progress');
          updateAnalysisProgress(fileIndex, filename, 0, parameters.maxIterations);
        }
      );
      
      // 결과 검증
      const successCount = results.filter(r => !r.error).length;
      const failCount = results.filter(r => r.error).length;
      
      addLog(`✓ Analysis complete: ${successCount} succeeded, ${failCount} failed`, 'success');
      
      if (failCount > 0) {
        addLog(`⚠ ${failCount} file(s) failed analysis`, 'warning');
        setHasError(true);
      }
      
      // 결과 저장 및 페이지 이동
      completeAnalysis(results);
      
      setTimeout(() => {
        setCurrentPage('results');
      }, 1500);
      
    } catch (error) {
      addLog(`✗ Analysis failed: ${error.message}`, 'error');
      setHasError(true);
    }
  };
  
  const getProgressPercentage = () => {
    if (uploadedFiles.length === 0) return 0;
    return (analysisStatus.currentFileIndex / uploadedFiles.length) * 100;
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Step 3/5: Running Analysis</h2>
          {analysisStatus.isRunning ? (
            <Loader size={24} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
          ) : hasError ? (
            <AlertCircle size={24} color="#EF4444" />
          ) : (
            <CheckCircle size={24} color="#10B981" />
          )}
        </div>
        
        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressInfo}>
            <span style={styles.progressLabel}>
              {analysisStatus.currentFile || 'Initializing...'}
            </span>
            <span style={styles.progressPercent}>
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
          
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${getProgressPercentage()}%`
              }}
            />
          </div>
          
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Completed:</span>
              <span style={styles.statValue}>
                {analysisStatus.currentFileIndex}/{uploadedFiles.length}
              </span>
            </div>
            
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Current Iteration:</span>
              <span style={styles.statValue}>
                {analysisStatus.currentIteration}/{parameters.maxIterations}
              </span>
            </div>
          </div>
        </div>
        
        {/* Log Console */}
        <div style={styles.logSection}>
          <h3 style={styles.logTitle}>Analysis Log</h3>
          <div style={styles.logContainer}>
            {logs.map((log, idx) => (
              <div key={idx} style={{
                ...styles.logEntry,
                ...(log.type === 'error' && styles.logError),
                ...(log.type === 'success' && styles.logSuccess),
                ...(log.type === 'warning' && styles.logWarning)
              }}>
                <span style={styles.logTime}>{log.timestamp}</span>
                <span style={styles.logMessage}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status Message */}
        {!analysisStatus.isRunning && !hasError && (
          <div style={styles.successMessage}>
            <CheckCircle size={20} />
            <span>Analysis completed successfully! Redirecting to results...</span>
          </div>
        )}
        
        {hasError && (
          <div style={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>Some files failed analysis. Check the log for details.</span>
            <button
              style={styles.continueButton}
              onClick={() => setCurrentPage('results')}
            >
              Continue to Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7FAFC',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #F7FAFC'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1A202C'
  },
  progressSection: {
    marginBottom: '2rem'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },
  progressLabel: {
    fontSize: '0.875rem',
    color: '#4A5568',
    fontWeight: '500'
  },
  progressPercent: {
    fontSize: '0.875rem',
    color: '#4F46E5',
    fontWeight: '700'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#E2E8F0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '1rem'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
    transition: 'width 0.5s ease',
    borderRadius: '6px'
  },
  statsRow: {
    display: 'flex',
    gap: '2rem'
  },
  statItem: {
    display: 'flex',
    gap: '0.5rem'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096'
  },
  statValue: {
    fontSize: '0.875rem',
    color: '#1A202C',
    fontWeight: '600'
  },
  logSection: {
    marginBottom: '1rem'
  },
  logTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: '0.5rem'
  },
  logContainer: {
    backgroundColor: '#1A202C',
    borderRadius: '8px',
    padding: '1rem',
    maxHeight: '300px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.875rem'
  },
  logEntry: {
    color: '#E2E8F0',
    padding: '0.25rem 0',
    display: 'flex',
    gap: '1rem'
  },
  logTime: {
    color: '#A0AEC0',
    minWidth: '80px'
  },
  logMessage: {
    flex: 1
  },
  logError: {
    color: '#FCA5A5'
  },
  logSuccess: {
    color: '#6EE7B7'
  },
  logWarning: {
    color: '#FCD34D'
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '8px',
    fontWeight: '500'
  },
  errorMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '8px',
    fontWeight: '500'
  },
  continueButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#DC2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    alignSelf: 'flex-start'
  }
};