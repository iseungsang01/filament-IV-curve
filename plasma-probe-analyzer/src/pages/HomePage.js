// ============================================
// src/pages/HomePage.js
// 메인 홈페이지
// ============================================
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Upload, Settings, BarChart3, FileText, Zap } from 'lucide-react';

export default function HomePage() {
  const { setCurrentPage, resetAnalysis } = useAnalysis();
  
  const handleStartNew = () => {
    resetAnalysis();
    setCurrentPage('upload');
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroIcon}>
          <Zap size={64} color="#4F46E5" />
        </div>
        <h1 style={styles.title}>Plasma Probe Analyzer</h1>
        <p style={styles.subtitle}>
          Advanced I-V Curve Analysis for Langmuir Probe Diagnostics
        </p>
        
        <button style={styles.startButton} onClick={handleStartNew}>
          <Upload size={20} />
          <span>Start New Analysis</span>
        </button>
      </div>
      
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>
            <Upload size={32} color="#4F46E5" />
          </div>
          <h3 style={styles.featureTitle}>Easy Upload</h3>
          <p style={styles.featureText}>
            Drag and drop your .dat files for instant batch processing
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>
            <Settings size={32} color="#10B981" />
          </div>
          <h3 style={styles.featureTitle}>Customizable Parameters</h3>
          <p style={styles.featureText}>
            Adjust probe radius, ion mass, magnetic field, and more
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>
            <BarChart3 size={32} color="#F59E0B" />
          </div>
          <h3 style={styles.featureTitle}>Visual Results</h3>
          <p style={styles.featureText}>
            Interactive plots and comprehensive statistical analysis
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>
            <FileText size={32} color="#EC4899" />
          </div>
          <h3 style={styles.featureTitle}>Export Data</h3>
          <p style={styles.featureText}>
            Download results in CSV format for further processing
          </p>
        </div>
      </div>
      
      <div style={styles.info}>
        <h3 style={styles.infoTitle}>About This Tool</h3>
        <p style={styles.infoText}>
          This application analyzes Langmuir probe I-V characteristics to extract
          key plasma parameters including electron temperature (Te), plasma potential (Vp),
          and electron/ion densities. The analysis uses iterative fitting algorithms to
          ensure accurate results across various plasma conditions.
        </p>
        
        <div style={styles.workflow}>
          <div style={styles.workflowStep}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepText}>Upload .dat files</div>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.workflowStep}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepText}>Set parameters</div>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.workflowStep}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepText}>Run analysis</div>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.workflowStep}>
            <div style={styles.stepNumber}>4</div>
            <div style={styles.stepText}>View results</div>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.workflowStep}>
            <div style={styles.stepNumber}>5</div>
            <div style={styles.stepText}>Export data</div>
          </div>
        </div>
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
  hero: {
    maxWidth: '800px',
    margin: '0 auto 4rem',
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  },
  heroIcon: {
    marginBottom: '1rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#718096',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.125rem',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.3s'
  },
  features: {
    maxWidth: '1200px',
    margin: '0 auto 4rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s'
  },
  featureIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: '12px'
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '0.5rem'
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#718096',
    lineHeight: '1.5'
  },
  info: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  infoTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '1rem'
  },
  infoText: {
    fontSize: '1rem',
    color: '#4A5568',
    lineHeight: '1.7',
    marginBottom: '2rem'
  },
  workflow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  workflowStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    backgroundColor: '#4F46E5',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  stepText: {
    fontSize: '0.875rem',
    color: '#4A5568',
    fontWeight: '500'
  },
  stepArrow: {
    fontSize: '1.5rem',
    color: '#CBD5E0',
    fontWeight: 'bold'
  }
};