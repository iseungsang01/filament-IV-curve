// src/pages/ExportPage.jsx
// ============================================
import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, Download, FileText, Image } from 'lucide-react';
import { resultsToCSV } from '../utils/mainAnalysis';

export default function ExportPage() {
  const { analysisResults, setCurrentPage } = useAnalysis();
  const [exported, setExported] = useState(false);
  
  const handleExportCSV = () => {
    const csv = resultsToCSV(analysisResults);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plasma_analysis_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };
  
  return (
    <div style={exportStyles.container}>
      <div style={exportStyles.header}>
        <button style={exportStyles.backButton} onClick={() => setCurrentPage('results')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 style={exportStyles.title}>Step 5/5: Export Results</h2>
      </div>
      
      <div style={exportStyles.content}>
        <div style={exportStyles.card}>
          <FileText size={48} color="#4F46E5" />
          <h3>Export as CSV</h3>
          <p>Download all analysis results in CSV format</p>
          <button style={exportStyles.exportButton} onClick={handleExportCSV}>
            <Download size={20} />
            Download CSV
          </button>
        </div>
        
        <div style={exportStyles.card}>
          <Image size={48} color="#10B981" />
          <h3>Export Plots</h3>
          <p>Save individual plots as PNG images</p>
          <button style={exportStyles.exportButton} disabled>
            <Download size={20} />
            Coming Soon
          </button>
        </div>
        
        {exported && (
          <div style={exportStyles.success}>
            ✓ File exported successfully!
          </div>
        )}
        
        <button style={exportStyles.doneButton} onClick={() => setCurrentPage('home')}>
          Done - Return to Home
        </button>
      </div>
    </div>
  );
}

const exportStyles = {
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
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '1rem'
  },
  success: {
    gridColumn: '1 / -1',
    padding: '1rem',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600'
  },
  doneButton: {
    gridColumn: '1 / -1',
    padding: '1rem',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600'
  }
};