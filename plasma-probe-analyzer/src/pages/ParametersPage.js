// ============================================
// src/pages/ParametersPage.js (Enhanced with tooltips)
// ============================================
import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, ArrowRight, Settings, Info, HelpCircle, Book } from 'lucide-react';

export default function ParametersPage() {
  const { parameters, updateParameters, setCurrentPage, uploadedFiles } = useAnalysis();
  const [localParams, setLocalParams] = useState(parameters);
  const [showHelp, setShowHelp] = useState({});
  
  const handleChange = (key, value) => {
    setLocalParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };
  
  const handleContinue = () => {
    updateParameters(localParams);
    setCurrentPage('analysis');
  };
  
  const toggleHelp = (key) => {
    setShowHelp(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('upload')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 style={styles.title}>Step 2/5: Set Parameters</h2>
        <button style={styles.helpButton} onClick={() => setCurrentPage('algorithm')}>
          <Book size={20} />
          <span>Documentation</span>
        </button>
      </div>
      
      <div style={styles.content}>
        {/* Physical Constants */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Settings size={24} color="#4F46E5" />
            <h3 style={styles.cardTitle}>Physical Constants</h3>
          </div>
          
          <div style={styles.paramGrid}>
            <ParamInput
              label="Probe Radius (m)"
              value={localParams.probeRadius}
              onChange={(val) => handleChange('probeRadius', val)}
              step="0.0001"
              hint={`${(localParams.probeRadius * 1000).toFixed(2)} mm`}
              helpKey="probeRadius"
              helpText="Radius of the cylindrical Langmuir probe. Typical values: 0.1-1.0 mm. Affects the probe surface area calculation for density."
              showHelp={showHelp.probeRadius}
              onToggleHelp={() => toggleHelp('probeRadius')}
            />
            
            <ParamInput
              label="Ion Mass (kg)"
              value={localParams.ionMass}
              onChange={(val) => handleChange('ionMass', val)}
              step="1e-27"
              hint="Ar: 6.63×10⁻²⁶ kg, He: 6.65×10⁻²⁷ kg"
              helpKey="ionMass"
              helpText="Mass of the plasma ions. Common gases: Argon (6.63e-26 kg), Helium (6.65e-27 kg), Hydrogen (1.67e-27 kg). Used to calculate ion sound speed."
              showHelp={showHelp.ionMass}
              onToggleHelp={() => toggleHelp('ionMass')}
            />
            
            <ParamInput
              label="Magnetic Field (T)"
              value={localParams.magneticField}
              onChange={(val) => handleChange('magneticField', val)}
              step="0.001"
              hint={`${(localParams.magneticField * 10000).toFixed(0)} Gauss`}
              helpKey="magneticField"
              helpText="Applied external magnetic field strength. Affects electron/ion trajectories. 1 Tesla = 10,000 Gauss. For unmagnetized plasmas, use 0."
              showHelp={showHelp.magneticField}
              onToggleHelp={() => toggleHelp('magneticField')}
            />
          </div>
        </div>
        
        {/* Fitting Options */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Settings size={24} color="#10B981" />
            <h3 style={styles.cardTitle}>Fitting Options</h3>
          </div>
          
          <div style={styles.paramGrid}>
            <ParamInput
              label="Max Iterations"
              value={localParams.maxIterations}
              onChange={(val) => handleChange('maxIterations', val)}
              step="1"
              hint="More iterations = better accuracy"
              helpKey="maxIterations"
              helpText="Maximum number of optimization iterations. Typical: 50-200. Algorithm stops early if convergence is reached. Higher values ensure better Vp accuracy but take longer."
              showHelp={showHelp.maxIterations}
              onToggleHelp={() => toggleHelp('maxIterations')}
            />
            
            <ParamInput
              label="Tolerance"
              value={localParams.tolerance}
              onChange={(val) => handleChange('tolerance', val)}
              step="1e-7"
              hint="Lower = more precise"
              helpKey="tolerance"
              helpText="Convergence criterion for Vp (in Volts). Algorithm stops when |Vp_new - Vp_old| < tolerance. Typical: 1e-6 to 1e-8. Smaller values = more precise but slower."
              showHelp={showHelp.tolerance}
              onToggleHelp={() => toggleHelp('tolerance')}
            />
            
            <div style={styles.paramItem}>
              <label style={styles.label}>
                a Coefficient
                <button
                  style={styles.infoButton}
                  onClick={() => toggleHelp('aCoefficient')}
                >
                  <HelpCircle size={14} />
                </button>
              </label>
              <input
                type="number"
                value={localParams.aCoefficient}
                disabled
                style={{ ...styles.input, backgroundColor: '#F7FAFC', cursor: 'not-allowed' }}
              />
              <span style={styles.hint}>Fixed sheath expansion coefficient</span>
              
              {showHelp.aCoefficient && (
                <div style={styles.helpBox}>
                  <strong>Sheath Expansion Coefficient (a)</strong>
                  <p>
                    Empirical parameter accounting for sheath expansion in electron saturation region.
                    Fixed at 1.02 based on typical probe theory. Not user-adjustable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Algorithm Info Banner */}
        <div style={styles.infoBanner}>
          <HelpCircle size={24} />
          <div>
            <strong>How does the algorithm work?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
              The analysis uses a 5-step process: preprocessing → estimation → optimization → density calculation → validation.
              Click "Documentation" above to learn more!
            </p>
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

// Parameter Input Component with Help
function ParamInput({ label, value, onChange, step, hint, helpText, helpKey, showHelp, onToggleHelp }) {
  return (
    <div style={styles.paramItem}>
      <label style={styles.label}>
        {label}
        <button
          style={styles.infoButton}
          onClick={onToggleHelp}
        >
          <HelpCircle size={14} />
        </button>
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
      <span style={styles.hint}>{hint}</span>
      
      {showHelp && (
        <div style={styles.helpBox}>
          {helpText}
        </div>
      )}
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
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap'
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
  helpButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#EEF2FF',
    border: '1px solid #4F46E5',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#4F46E5',
    fontWeight: '600'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1A202C',
    flex: 1,
    textAlign: 'center'
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
    justifyContent: 'space-between'
  },
  infoButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#A0AEC0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s'
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
  helpBox: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#EEF2FF',
    border: '2px solid #C7D2FE',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#4C1D95',
    lineHeight: '1.5'
  },
  infoBanner: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#DBEAFE',
    borderRadius: '12px',
    border: '2px solid #93C5FD',
    color: '#1E3A8A'
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