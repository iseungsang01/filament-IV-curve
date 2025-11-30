import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, ArrowRight, Settings, Info } from 'lucide-react';

export default function ParametersPage() {
  const { parameters, updateParameters, setCurrentPage, uploadedFiles } = useAnalysis();
  const [localParams, setLocalParams] = useState(parameters);
  
  const handleChange = (key, value) => {
    setLocalParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };
  
  const handleContinue = () => {
    updateParameters(localParams);
    setCurrentPage('analysis');
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('upload')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 style={styles.title}>Step 2/5: Set Parameters</h2>
      </div>
      
      <div style={styles.content}>
        {/* Physical Constants */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Settings size={24} color="#4F46E5" />
            <h3 style={styles.cardTitle}>Physical Constants</h3>
          </div>
          
          <div style={styles.paramGrid}>
            <div style={styles.paramItem}>
              <label style={styles.label}>
                Probe Radius (m)
                <span style={styles.tooltip} title="Cylindrical probe radius">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                step="0.001"
                value={localParams.probeRadius}
                onChange={(e) => handleChange('probeRadius', e.target.value)}
                style={styles.input}
              />
              <span style={styles.hint}>{(localParams.probeRadius * 1000).toFixed(1)} mm</span>
            </div>
            
            <div style={styles.paramItem}>
              <label style={styles.label}>
                Ion Mass (kg)
                <span style={styles.tooltip} title="Ar: 6.63e-26, He: 6.65e-27">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                step="1e-27"
                value={localParams.ionMass}
                onChange={(e) => handleChange('ionMass', e.target.value)}
                style={styles.input}
              />
              <span style={styles.hint}>Ar: 6.63e-26 kg</span>
            </div>
            
            <div style={styles.paramItem}>
              <label style={styles.label}>
                Magnetic Field (T)
                <span style={styles.tooltip} title="Applied magnetic field strength">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                step="0.001"
                value={localParams.magneticField}
                onChange={(e) => handleChange('magneticField', e.target.value)}
                style={styles.input}
              />
              <span style={styles.hint}>{(localParams.magneticField * 10000).toFixed(0)} Gauss</span>
            </div>
          </div>
        </div>
        
        {/* Fitting Options */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Settings size={24} color="#10B981" />
            <h3 style={styles.cardTitle}>Fitting Options</h3>
          </div>
          
          <div style={styles.paramGrid}>
            <div style={styles.paramItem}>
              <label style={styles.label}>
                Max Iterations
                <span style={styles.tooltip} title="Maximum number of iterations for convergence">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                value={localParams.maxIterations}
                onChange={(e) => handleChange('maxIterations', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.paramItem}>
              <label style={styles.label}>
                Tolerance
                <span style={styles.tooltip} title="Convergence criterion for Vp">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                step="1e-6"
                value={localParams.tolerance}
                onChange={(e) => handleChange('tolerance', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.paramItem}>
              <label style={styles.label}>
                a Coefficient
                <span style={styles.tooltip} title="Sheath expansion coefficient (fixed)">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="number"
                value={localParams.aCoefficient}
                disabled
                style={{ ...styles.input, backgroundColor: '#F7FAFC' }}
              />
              <span style={styles.hint}>Fixed value</span>
            </div>
          </div>
        </div>
        
        {/* Summary */}
        <div style={styles.summary}>
          <h4 style={styles.summaryTitle}>Ready to Analyze</h4>
          <p style={styles.summaryText}>
            {uploadedFiles.length} file(s) will be analyzed with the parameters above.
          </p>
          <p style={styles.summaryDetail}>
            Estimated time: ~{Math.ceil(uploadedFiles.length * 2)}s
          </p>
        </div>
        
        {/* Continue Button */}
        <button style={styles.continueButton} onClick={handleContinue}>
          <span>Start Analysis</span>
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
    maxWidth: '1200px',
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
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #F7FAFC'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1A202C'
  },
  paramGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  paramItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4A5568',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  tooltip: {
    color: '#A0AEC0',
    cursor: 'help'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.2s'
  },
  hint: {
    fontSize: '0.75rem',
    color: '#A0AEC0'
  },
  summary: {
    backgroundColor: '#EEF2FF',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px solid #C7D2FE'
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#4C1D95',
    marginBottom: '0.5rem'
  },
  summaryText: {
    color: '#5B21B6',
    marginBottom: '0.25rem'
  },
  summaryDetail: {
    fontSize: '0.875rem',
    color: '#7C3AED'
  },
  continueButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600'
  }
};