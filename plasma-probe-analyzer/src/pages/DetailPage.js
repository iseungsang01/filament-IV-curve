// ============================================
// src/pages/DetailPage.jsx
// ============================================
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Plot from 'react-plotly.js';

export default function DetailPage() {
  const { selectedResult, uploadedFiles, setCurrentPage } = useAnalysis();
  
  if (!selectedResult) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>No result selected</p>
          <button onClick={() => setCurrentPage('results')}>
            Back to Results
          </button>
        </div>
      </div>
    );
  }
  
  // 원본 데이터 찾기
  const fileData = uploadedFiles.find(f => f.filename === selectedResult.filename);
  
  if (!fileData) {
    return <div>File data not found</div>;
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('results')}>
          <ArrowLeft size={20} />
          Back to Results
        </button>
        <h2 style={styles.title}>Detailed Analysis: {selectedResult.filename}</h2>
      </div>
      
      <div style={styles.content}>
        {/* Parameters Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Extracted Parameters</h3>
          <div style={styles.paramGrid}>
            <ParamItem label="Plasma Potential (Vp)" value={`${selectedResult.Vp.toFixed(2)} ± ${selectedResult.VpErr.toFixed(2)} V`} />
            <ParamItem label="Electron Temperature (Te)" value={`${selectedResult.Te.toFixed(2)} ± ${selectedResult.TeErr.toFixed(2)} eV`} />
            <ParamItem label="Ion Saturation Current (Isat)" value={`${(selectedResult.Isat * 1000).toFixed(2)} mA`} />
            <ParamItem label="Electron Saturation Current (Ies)" value={`${(selectedResult.Ies * 1000).toFixed(2)} mA`} />
            <ParamItem label="Ion Density (ni)" value={`${selectedResult.ni.toExponential(2)} m⁻³`} />
            <ParamItem label="Electron Density (ne)" value={`${selectedResult.ne.toExponential(2)} m⁻³`} />
            <ParamItem label="Density Ratio (ne/ni)" value={selectedResult.ratio.toFixed(4)} 
              status={selectedResult.ratio >= 0.8 && selectedResult.ratio <= 1.2} />
            <ParamItem label="Iterations" value={selectedResult.iterations} 
              status={selectedResult.converged} />
          </div>
        </div>
        
        {/* I-V Plot */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>I-V Characteristic</h3>
          <Plot
            data={[
              {
                x: fileData.voltage,
                y: fileData.current,
                type: 'scatter',
                mode: 'markers',
                name: 'Raw Data',
                marker: { size: 3, color: '#94A3B8' }
              },
              {
                x: [selectedResult.Vp],
                y: [selectedResult.Ies],
                type: 'scatter',
                mode: 'markers',
                name: 'Plasma Potential',
                marker: { size: 15, color: '#EF4444', symbol: 'star' }
              }
            ]}
            layout={{
              title: 'Current vs Voltage',
              xaxis: { title: 'Voltage (V)' },
              yaxis: { title: 'Current (A)' },
              hovermode: 'closest',
              height: 400
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        </div>
      </div>
    </div>
  );
}

function ParamItem({ label, value, status }) {
  return (
    <div style={styles.paramItem}>
      <div style={styles.paramLabel}>{label}</div>
      <div style={styles.paramValue}>
        {value}
        {status !== undefined && (
          status ? 
            <CheckCircle size={16} color="#10B981" /> : 
            <XCircle size={16} color="#EF4444" />
        )}
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
    fontSize: '1.25rem',
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
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1A202C'
  },
  paramGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  paramItem: {
    padding: '1rem',
    backgroundColor: '#F7FAFC',
    borderRadius: '8px'
  },
  paramLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    marginBottom: '0.5rem'
  },
  paramValue: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1A202C',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};