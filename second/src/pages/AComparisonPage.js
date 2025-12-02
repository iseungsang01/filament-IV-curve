// ============================================
// src/pages/AComparisonPage.js
// a 계수 비교 분석 페이지 (0.5 ~ 1.0)
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, GitCompare, Loader, AlertCircle } from 'lucide-react';
import Plot from 'react-plotly.js';
import { analyzeWithDifferentA } from '../utils/mainAnalysis';

const A_VALUES = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function AComparisonPage() {
  const { uploadedFiles, parameters, setCurrentPage } = useAnalysis();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('vp'); // vp, te, density, ratio
  
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      runAnalysis();
    }
  }, []);
  
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const allResults = {};
      
      for (const file of uploadedFiles) {
        const fileResults = await analyzeWithDifferentA(file, parameters, A_VALUES);
        allResults[file.filename] = fileResults;
      }
      
      setResults(allResults);
      
      // 첫 번째 파일을 기본 선택
      if (uploadedFiles.length > 0) {
        setSelectedFile(uploadedFiles[0].filename);
      }
      
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 선택된 파일의 결과
  const selectedResults = useMemo(() => {
    if (!results || !selectedFile) return null;
    return results[selectedFile];
  }, [results, selectedFile]);
  
  // 플롯 데이터 생성
  const plotData = useMemo(() => {
    if (!selectedResults) return null;
    
    return {
      vp: A_VALUES.map((a, idx) => ({
        a: a,
        value: selectedResults[idx].Vp,
        error: selectedResults[idx].VpErr,
        color: COLORS[idx]
      })),
      te: A_VALUES.map((a, idx) => ({
        a: a,
        value: selectedResults[idx].Te,
        error: selectedResults[idx].TeErr,
        color: COLORS[idx]
      })),
      ni: A_VALUES.map((a, idx) => ({
        a: a,
        value: selectedResults[idx].ni,
        error: selectedResults[idx].niErr,
        color: COLORS[idx]
      })),
      ne: A_VALUES.map((a, idx) => ({
        a: a,
        value: selectedResults[idx].ne,
        error: selectedResults[idx].neErr,
        color: COLORS[idx]
      })),
      ratio: A_VALUES.map((a, idx) => ({
        a: a,
        value: selectedResults[idx].ratio,
        error: selectedResults[idx].ratioErr,
        color: COLORS[idx]
      }))
    };
  }, [selectedResults]);
  
  const renderPlot = () => {
    if (!plotData) return null;
    
    switch (activeTab) {
      case 'vp':
        return (
          <Plot
            data={[{
              x: plotData.vp.map(d => d.a),
              y: plotData.vp.map(d => d.value),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Plasma Potential',
              line: { color: '#4F46E5', width: 3 },
              marker: { size: 10, color: COLORS },
              error_y: {
                type: 'data',
                array: plotData.vp.map(d => d.error),
                visible: true
              }
            }]}
            layout={{
              title: 'Plasma Potential vs a Coefficient',
              xaxis: { 
                title: 'a Coefficient',
                dtick: 0.1
              },
              yaxis: { title: 'Vp (V)' },
              hovermode: 'closest',
              showlegend: true,
              height: 500
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        );
      
      case 'te':
        return (
          <Plot
            data={[{
              x: plotData.te.map(d => d.a),
              y: plotData.te.map(d => d.value),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Electron Temperature',
              line: { color: '#EC4899', width: 3 },
              marker: { size: 10, color: COLORS },
              error_y: {
                type: 'data',
                array: plotData.te.map(d => d.error),
                visible: true
              }
            }]}
            layout={{
              title: 'Electron Temperature vs a Coefficient',
              xaxis: { 
                title: 'a Coefficient',
                dtick: 0.1
              },
              yaxis: { title: 'Te (eV)' },
              hovermode: 'closest',
              showlegend: true,
              height: 500
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        );
      
      case 'density':
        return (
          <Plot
            data={[
              {
                x: plotData.ni.map(d => d.a),
                y: plotData.ni.map(d => d.value),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Ion Density (ni)',
                line: { color: '#EF4444', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.ni.map(d => d.error),
                  visible: true
                }
              },
              {
                x: plotData.ne.map(d => d.a),
                y: plotData.ne.map(d => d.value),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Electron Density (ne)',
                line: { color: '#3B82F6', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.ne.map(d => d.error),
                  visible: true
                }
              }
            ]}
            layout={{
              title: 'Density vs a Coefficient',
              xaxis: { 
                title: 'a Coefficient',
                dtick: 0.1
              },
              yaxis: { 
                title: 'Density (m⁻³)',
                type: 'linear'
              },
              hovermode: 'closest',
              showlegend: true,
              height: 500
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        );
      
      case 'ratio':
        return (
          <Plot
            data={[
              {
                x: plotData.ratio.map(d => d.a),
                y: plotData.ratio.map(d => d.value),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'ne/ni Ratio',
                line: { color: '#10B981', width: 3 },
                marker: { size: 10, color: COLORS },
                error_y: {
                  type: 'data',
                  array: plotData.ratio.map(d => d.error),
                  visible: true
                }
              },
              {
                x: [0.5, 1.0],
                y: [1, 1],
                type: 'scatter',
                mode: 'lines',
                name: 'Quasineutrality (1.0)',
                line: { color: '#6B7280', width: 1, dash: 'dash' }
              }
            ]}
            layout={{
              title: 'Density Ratio vs a Coefficient',
              xaxis: { 
                title: 'a Coefficient',
                dtick: 0.1
              },
              yaxis: { 
                title: 'ne/ni Ratio',
                range: [0.5, 1.5]
              },
              shapes: [{
                type: 'rect',
                xref: 'paper',
                x0: 0,
                x1: 1,
                yref: 'y',
                y0: 0.8,
                y1: 1.2,
                fillcolor: '#D1FAE5',
                opacity: 0.3,
                line: { width: 0 }
              }],
              hovermode: 'closest',
              showlegend: true,
              height: 500
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        );
      
      default:
        return null;
    }
  };
  
  if (uploadedFiles.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => setCurrentPage('home')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <h2 style={styles.title}>a Coefficient Comparison</h2>
        </div>
        
        <div style={styles.emptyState}>
          <AlertCircle size={48} color="#EF4444" />
          <h3>No Files Uploaded</h3>
          <p>Please upload data files first to compare different a coefficients.</p>
          <button style={styles.uploadButton} onClick={() => setCurrentPage('upload')}>
            Go to Upload
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <h2 style={styles.title}>
          <GitCompare size={28} />
          a Coefficient Comparison
        </h2>
      </div>
      
      <div style={styles.content}>
        {isAnalyzing && (
          <div style={styles.loadingCard}>
            <Loader size={48} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
            <h3>Analyzing with different a values...</h3>
            <p>Testing a = {A_VALUES.join(', ')}</p>
          </div>
        )}
        
        {error && (
          <div style={styles.errorCard}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}
        
        {results && !isAnalyzing && (
          <>
            {/* File Selector */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Select File</h3>
              <div style={styles.fileSelector}>
                {uploadedFiles.map((file) => (
                  <button
                    key={file.filename}
                    style={{
                      ...styles.fileButton,
                      ...(selectedFile === file.filename && styles.fileButtonActive)
                    }}
                    onClick={() => setSelectedFile(file.filename)}
                  >
                    {file.filename}
                    {file.position !== null && ` (${file.position} cm)`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Results Table */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Comparison Table - {selectedFile}</h3>
              <div style={styles.tableContainer}>
                <table>
                  <thead>
                    <tr>
                      <th>a</th>
                      <th>Vp (V)</th>
                      <th>Te (eV)</th>
                      <th>ni (m⁻³)</th>
                      <th>ne (m⁻³)</th>
                      <th>Ratio (ne/ni)</th>
                      <th>Converged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResults && A_VALUES.map((a, idx) => {
                      const result = selectedResults[idx];
                      return (
                        <tr key={idx} style={{ backgroundColor: `${COLORS[idx]}10` }}>
                          <td style={{ fontWeight: 'bold', color: COLORS[idx] }}>{a.toFixed(1)}</td>
                          <td>{result.Vp.toFixed(2)} ± {result.VpErr.toFixed(2)}</td>
                          <td>{result.Te.toFixed(2)} ± {result.TeErr.toFixed(2)}</td>
                          <td>{result.ni.toExponential(2)}</td>
                          <td>{result.ne.toExponential(2)}</td>
                          <td style={{
                            color: result.ratio >= 0.8 && result.ratio <= 1.2 ? '#10B981' : '#EF4444',
                            fontWeight: 'bold'
                          }}>
                            {result.ratio.toFixed(3)}
                          </td>
                          <td>{result.converged ? '✓' : '✗'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Plots */}
            <div style={styles.card}>
              <div style={styles.tabs}>
                <button
                  style={{...styles.tab, ...(activeTab === 'vp' && styles.tabActive)}}
                  onClick={() => setActiveTab('vp')}
                >
                  Plasma Potential
                </button>
                <button
                  style={{...styles.tab, ...(activeTab === 'te' && styles.tabActive)}}
                  onClick={() => setActiveTab('te')}
                >
                  Electron Temperature
                </button>
                <button
                  style={{...styles.tab, ...(activeTab === 'density' && styles.tabActive)}}
                  onClick={() => setActiveTab('density')}
                >
                  Densities
                </button>
                <button
                  style={{...styles.tab, ...(activeTab === 'ratio' && styles.tabActive)}}
                  onClick={() => setActiveTab('ratio')}
                >
                  Density Ratio
                </button>
              </div>
              
              <div style={styles.plotContainer}>
                {renderPlot()}
              </div>
            </div>
            
            {/* Info Box */}
            <div style={styles.infoBox}>
              <h4>📊 About a Coefficient</h4>
              <p>
                The sheath expansion coefficient <strong>a</strong> affects how ion current varies
                with voltage in the ion saturation region. Standard probe theory uses a=1.02, but
                different plasma conditions or probe geometries may require different values.
              </p>
              <ul>
                <li><strong>Lower a (0.5-0.7):</strong> Less sheath expansion, flatter I-V curve</li>
                <li><strong>Higher a (0.9-1.0):</strong> More sheath expansion, steeper I-V curve</li>
                <li><strong>Standard (1.02):</strong> Empirical value from probe theory literature</li>
              </ul>
            </div>
          </>
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
    maxWidth: '1400px',
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
    color: '#1A202C',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
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
  fileSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  fileButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#F7FAFC',
    border: '2px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#4A5568',
    transition: 'all 0.2s'
  },
  fileButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    color: '#4F46E5',
    fontWeight: '600'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #E2E8F0',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#718096',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#4F46E5',
    borderBottomColor: '#4F46E5'
  },
  plotContainer: {
    minHeight: '500px'
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    border: '2px solid #C7D2FE',
    borderRadius: '12px',
    padding: '1.5rem',
    color: '#4C1D95'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '2rem auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  uploadButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '1rem'
  }
};