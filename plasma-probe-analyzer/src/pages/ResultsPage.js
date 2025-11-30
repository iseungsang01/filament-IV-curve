import React, { useState, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, Download, Eye, TrendingUp, Activity } from 'lucide-react';
import Plot from 'react-plotly.js';

export default function ResultsPage() {
  const { analysisResults, setSelectedResult, setCurrentPage } = useAnalysis();
  const [activeTab, setActiveTab] = useState('spatial'); // spatial, density, te
  
  // 통계 계산
  const stats = useMemo(() => {
    const validResults = analysisResults.filter(r => !r.error);
    
    if (validResults.length === 0) return null;
    
    const avgTe = validResults.reduce((sum, r) => sum + r.Te, 0) / validResults.length;
    const avgNe = validResults.reduce((sum, r) => sum + r.ne, 0) / validResults.length;
    const avgRatio = validResults.reduce((sum, r) => sum + r.ratio, 0) / validResults.length;
    
    const ratiosInRange = validResults.filter(r => r.ratio >= 0.8 && r.ratio <= 1.2).length;
    const quasineutralityPercent = (ratiosInRange / validResults.length) * 100;
    
    return {
      totalFiles: analysisResults.length,
      successCount: validResults.length,
      failCount: analysisResults.length - validResults.length,
      avgTe: avgTe.toFixed(2),
      avgNe: avgNe.toExponential(2),
      avgRatio: avgRatio.toFixed(3),
      quasineutrality: quasineutralityPercent.toFixed(0)
    };
  }, [analysisResults]);
  
  // 정렬된 데이터 (position 기준)
  const sortedResults = useMemo(() => {
    return [...analysisResults]
      .filter(r => !r.error)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [analysisResults]);
  
  // 플롯 데이터
  const plotData = useMemo(() => {
    const positions = sortedResults.map(r => r.position);
    
    return {
      spatial: {
        vp: sortedResults.map(r => r.Vp),
        te: sortedResults.map(r => r.Te),
        teErr: sortedResults.map(r => r.TeErr)
      },
      density: {
        ni: sortedResults.map(r => r.ni),
        ne: sortedResults.map(r => r.ne),
        niErr: sortedResults.map(r => r.niErr),
        neErr: sortedResults.map(r => r.neErr)
      },
      ratio: sortedResults.map(r => r.ratio),
      ratioErr: sortedResults.map(r => r.ratioErr),
      positions
    };
  }, [sortedResults]);
  
  const renderPlot = () => {
    switch (activeTab) {
      case 'spatial':
        return (
          <Plot
            data={[
              {
                x: plotData.positions,
                y: plotData.spatial.vp,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Vp',
                line: { color: '#4F46E5', width: 2 },
                marker: { size: 8 }
              },
              {
                x: plotData.positions,
                y: plotData.spatial.te,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Te',
                yaxis: 'y2',
                line: { color: '#EC4899', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.spatial.teErr,
                  visible: true
                }
              }
            ]}
            layout={{
              title: 'Plasma Potential & Electron Temperature',
              xaxis: { title: 'Position (cm)' },
              yaxis: { title: 'Plasma Potential Vp (V)', side: 'left' },
              yaxis2: {
                title: 'Electron Temperature Te (eV)',
                overlaying: 'y',
                side: 'right'
              },
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
                x: plotData.positions,
                y: plotData.density.ni,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Ion Density (ni)',
                line: { color: '#EF4444', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.density.niErr,
                  visible: true
                }
              },
              {
                x: plotData.positions,
                y: plotData.density.ne,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Electron Density (ne)',
                line: { color: '#3B82F6', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.density.neErr,
                  visible: true
                }
              }
            ]}
            layout={{
              title: 'Ion & Electron Density Profile',
              xaxis: { title: 'Position (cm)' },
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
      
      case 'te':
        return (
          <Plot
            data={[
              {
                x: plotData.positions,
                y: plotData.ratio,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'ne/ni Ratio',
                line: { color: '#10B981', width: 2 },
                marker: { size: 8 },
                error_y: {
                  type: 'data',
                  array: plotData.ratioErr,
                  visible: true
                }
              },
              {
                x: plotData.positions,
                y: new Array(plotData.positions.length).fill(1),
                type: 'scatter',
                mode: 'lines',
                name: 'Quasineutrality (1.0)',
                line: { color: '#6B7280', width: 1, dash: 'dash' }
              }
            ]}
            layout={{
              title: 'Quasineutrality Check (ne/ni Ratio)',
              xaxis: { title: 'Position (cm)' },
              yaxis: { 
                title: 'Density Ratio (ne/ni)',
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
  
  if (!stats) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          <Activity size={48} color="#EF4444" />
          <h2>No Valid Results</h2>
          <p>All files failed analysis. Please check your data and try again.</p>
          <button onClick={() => setCurrentPage('upload')} style={styles.retryButton}>
            Start Over
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('parameters')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 style={styles.title}>Step 4/5: Analysis Results</h2>
        <button style={styles.exportButton} onClick={() => setCurrentPage('export')}>
          <Download size={20} />
          <span>Export</span>
        </button>
      </div>
      
      <div style={styles.content}>
        {/* Summary Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon} style={{ backgroundColor: '#DBEAFE' }}>
              <TrendingUp size={24} color="#3B82F6" />
            </div>
            <div>
              <div style={styles.statValue}>{stats.successCount}/{stats.totalFiles}</div>
              <div style={styles.statLabel}>Files Analyzed</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon} style={{ backgroundColor: '#FCE7F3' }}>
              <Activity size={24} color="#EC4899" />
            </div>
            <div>
              <div style={styles.statValue}>{stats.avgTe} eV</div>
              <div style={styles.statLabel}>Avg Electron Temp</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon} style={{ backgroundColor: '#D1FAE5' }}>
              <Activity size={24} color="#10B981" />
            </div>
            <div>
              <div style={styles.statValue}>{stats.avgNe} m⁻³</div>
              <div style={styles.statLabel}>Avg Electron Density</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon} style={{ backgroundColor: '#FEF3C7' }}>
              <Activity size={24} color="#F59E0B" />
            </div>
            <div>
              <div style={styles.statValue}>{stats.quasineutrality}%</div>
              <div style={styles.statLabel}>Quasineutrality</div>
            </div>
          </div>
        </div>
        
        {/* Plot Tabs */}
        <div style={styles.plotSection}>
          <div style={styles.tabs}>
            <button
              style={{...styles.tab, ...(activeTab === 'spatial' && styles.tabActive)}}
              onClick={() => setActiveTab('spatial')}
            >
              Vp & Te Profile
            </button>
            <button
              style={{...styles.tab, ...(activeTab === 'density' && styles.tabActive)}}
              onClick={() => setActiveTab('density')}
            >
              Density Profile
            </button>
            <button
              style={{...styles.tab, ...(activeTab === 'te' && styles.tabActive)}}
              onClick={() => setActiveTab('te')}
            >
              Quasineutrality
            </button>
          </div>
          
          <div style={styles.plotContainer}>
            {renderPlot()}
          </div>
        </div>
        
        {/* Data Table */}
        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Detailed Results</h3>
          <div style={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Vp (V)</th>
                  <th>Te (eV)</th>
                  <th>ni (m⁻³)</th>
                  <th>ne (m⁻³)</th>
                  <th>Ratio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, idx) => (
                  <tr key={idx}>
                    <td>{result.position?.toFixed(1) || 'N/A'}</td>
                    <td>{result.Vp.toFixed(2)}</td>
                    <td>{result.Te.toFixed(2)} ± {result.TeErr.toFixed(2)}</td>
                    <td>{result.ni.toExponential(2)}</td>
                    <td>{result.ne.toExponential(2)}</td>
                    <td style={{
                      color: result.ratio >= 0.8 && result.ratio <= 1.2 ? '#10B981' : '#EF4444'
                    }}>
                      {result.ratio.toFixed(3)}
                    </td>
                    <td>
                      <button
                        style={styles.viewButton}
                        onClick={() => {
                          setSelectedResult(result);
                          setCurrentPage('detail');
                        }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  header: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1A202C'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096'
  },
  plotSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #E2E8F0'
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
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  tableTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1A202C'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    textAlign: 'center'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '1rem'
  }
};