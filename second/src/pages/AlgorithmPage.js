// ============================================
// src/pages/AlgorithmPage.js
// 알고리즘 설명 페이지
// ============================================
import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ArrowLeft, Book, Code, Cpu, Activity, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export default function AlgorithmPage() {
  const { setCurrentPage } = useAnalysis();
  const [expandedSections, setExpandedSections] = useState({});
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h2 style={styles.title}>
          <Book size={32} />
          Algorithm Documentation
        </h2>
      </div>
      
      <div style={styles.content}>
        {/* Overview */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Lightbulb size={24} color="#F59E0B" />
            <h3 style={styles.cardTitle}>Overview</h3>
          </div>
          <p style={styles.text}>
            This tool analyzes Langmuir probe I-V characteristics using a multi-step iterative algorithm
            to extract plasma parameters: <strong>Plasma Potential (Vp)</strong>, <strong>Electron Temperature (Te)</strong>,
            and <strong>Ion/Electron Densities (ni, ne)</strong>.
          </p>
        </div>
        
        {/* Process Flow */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Activity size={24} color="#4F46E5" />
            <h3 style={styles.cardTitle}>Analysis Process Flow</h3>
          </div>
          
          <div style={styles.flowDiagram}>
            {[
              { num: 1, title: 'Data Preprocessing', desc: 'Sort and validate I-V data' },
              { num: 2, title: 'Initial Estimation', desc: 'Estimate Vp, Te, Isat, Ies' },
              { num: 3, title: 'Iterative Optimization', desc: 'Refine Vp using gradient descent' },
              { num: 4, title: 'Density Calculation', desc: 'Compute ni and ne from currents' },
              { num: 5, title: 'Validation', desc: 'Check physical validity and quasineutrality' }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={styles.flowStep}>
                  <div style={styles.flowNumber}>{step.num}</div>
                  <div>
                    <div style={styles.flowTitle}>{step.title}</div>
                    <div style={styles.flowDesc}>{step.desc}</div>
                  </div>
                </div>
                {idx < 4 && <div style={styles.flowArrow}>↓</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Detailed Algorithms */}
        <Section
          icon={<Code size={24} color="#10B981" />}
          title="Step 1: Data Preprocessing"
          expanded={expandedSections.step1}
          onToggle={() => toggleSection('step1')}
        >
          <h4 style={styles.subTitle}>Purpose</h4>
          <p style={styles.text}>
            Ensure data is properly sorted and clean for analysis.
          </p>
          
          <h4 style={styles.subTitle}>Process</h4>
          <ol style={styles.list}>
            <li>Pair voltage and current data</li>
            <li>Sort by voltage in ascending order</li>
            <li>Remove any invalid data points (NaN, Infinity)</li>
          </ol>
          
          <div style={styles.codeBlock}>
            <code>{`voltage-current pairs → sort by voltage → clean data`}</code>
          </div>
        </Section>
        
        <Section
          icon={<Code size={24} color="#10B981" />}
          title="Step 2: Initial Parameter Estimation"
          expanded={expandedSections.step2}
          onToggle={() => toggleSection('step2')}
        >
          <h4 style={styles.subTitle}>A. Ion Saturation Current (Isat)</h4>
          <p style={styles.text}>
            <strong>Physical Meaning:</strong> Current when probe is at low voltage (ions absorbed)
          </p>
          <p style={styles.text}>
            <strong>Method:</strong> Average of lowest 20% voltage region
          </p>
          <div style={styles.formula}>
            I<sub>sat</sub> = Average(I) for V in [V<sub>min</sub>, V<sub>min</sub> + 20%]
          </div>
          
          <h4 style={styles.subTitle}>B. Electron Saturation Current (Ies)</h4>
          <p style={styles.text}>
            <strong>Physical Meaning:</strong> Current when probe is at high voltage (electrons attracted)
          </p>
          <p style={styles.text}>
            <strong>Method:</strong> Average of highest 20% voltage region
          </p>
          <div style={styles.formula}>
            I<sub>es</sub> = Average(I) for V in [V<sub>max</sub> - 20%, V<sub>max</sub>]
          </div>
          
          <h4 style={styles.subTitle}>C. Plasma Potential (Vp)</h4>
          <p style={styles.text}>
            <strong>Physical Meaning:</strong> Voltage where current derivative is maximum
          </p>
          <p style={styles.text}>
            <strong>Method:</strong> Find maximum of dI/dV using central difference
          </p>
          <div style={styles.formula}>
            dI/dV = (I[i+2] - I[i-2]) / (V[i+2] - V[i-2])
            <br />
            V<sub>p</sub> = V where |dI/dV| is maximum
          </div>
          
          <h4 style={styles.subTitle}>D. Electron Temperature (Te)</h4>
          <p style={styles.text}>
            <strong>Physical Meaning:</strong> Average kinetic energy of electrons (in eV)
          </p>
          <p style={styles.text}>
            <strong>Method:</strong> Linear regression of ln(I) vs V in transition region (Vp ± 5V)
          </p>
          <div style={styles.formula}>
            ln(I) = ln(I₀) + (e/k<sub>B</sub>T<sub>e</sub>) × V
            <br />
            T<sub>e</sub> [eV] = 1 / slope
          </div>
          
          <div style={styles.infoBox}>
            <strong>⚠️ Note:</strong> Te is constrained to 0.5-20 eV for physical validity
          </div>
        </Section>
        
        <Section
          icon={<Cpu size={24} color="#EC4899" />}
          title="Step 3: Iterative Optimization"
          expanded={expandedSections.step3}
          onToggle={() => toggleSection('step3')}
        >
          <h4 style={styles.subTitle}>Purpose</h4>
          <p style={styles.text}>
            Refine Vp to achieve better convergence using gradient descent algorithm.
          </p>
          
          <h4 style={styles.subTitle}>Algorithm</h4>
          <div style={styles.codeBlock}>
            <code>{`for iteration = 0 to maxIterations:
    1. Recalculate Te at current Vp
    2. Compute gradient around Vp
    3. Update: Vp_new = Vp - learningRate × gradient
    4. Check convergence: |Vp_new - Vp| < tolerance
    5. If converged, break
    
Learning Rate: 0.1
Tolerance: 1e-6 V`}</code>
          </div>
          
          <div style={styles.infoBox}>
            <strong>💡 Tip:</strong> Typical convergence occurs in 10-50 iterations
          </div>
        </Section>
        
        <Section
          icon={<Activity size={24} color="#7C3AED" />}
          title="Step 4: Density Calculation"
          expanded={expandedSections.step4}
          onToggle={() => toggleSection('step4')}
        >
          <h4 style={styles.subTitle}>A. Ion Density (ni)</h4>
          <div style={styles.formula}>
            n<sub>i</sub> = I<sub>sat</sub> / (0.61 × e × A<sub>p</sub> × c<sub>s</sub>)
            <br /><br />
            where:
            <br />
            • c<sub>s</sub> = √(k<sub>B</sub>T<sub>e</sub> / M<sub>ion</sub>) [ion sound speed]
            <br />
            • A<sub>p</sub> = 2πr × L [probe surface area]
            <br />
            • 0.61 = Bohm sheath coefficient
          </div>
          
          <h4 style={styles.subTitle}>B. Electron Density (ne)</h4>
          <div style={styles.formula}>
            n<sub>e</sub> = I<sub>es</sub> / (0.25 × e × A<sub>p</sub> × v<sub>th,e</sub>)
            <br /><br />
            where:
            <br />
            • v<sub>th,e</sub> = √(8k<sub>B</sub>T<sub>e</sub> / πm<sub>e</sub>) [electron thermal velocity]
            <br />
            • 0.25 = thermal equilibrium coefficient
          </div>
          
          <h4 style={styles.subTitle}>Physical Constants</h4>
          <ul style={styles.list}>
            <li>e = 1.602 × 10⁻¹⁹ C (elementary charge)</li>
            <li>k<sub>B</sub> = 1.381 × 10⁻²³ J/K (Boltzmann constant)</li>
            <li>m<sub>e</sub> = 9.109 × 10⁻³¹ kg (electron mass)</li>
          </ul>
        </Section>
        
        <Section
          icon={<Activity size={24} color="#EF4444" />}
          title="Step 5: Validation & Quasineutrality"
          expanded={expandedSections.step5}
          onToggle={() => toggleSection('step5')}
        >
          <h4 style={styles.subTitle}>Density Range Check</h4>
          <p style={styles.text}>
            Valid plasma densities should be in the range:
          </p>
          <div style={styles.formula}>
            10¹⁴ m⁻³ &lt; n<sub>i</sub>, n<sub>e</sub> &lt; 10²⁰ m⁻³
          </div>
          <p style={styles.text}>
            Values outside this range are marked as NaN (calculation error).
          </p>
          
          <h4 style={styles.subTitle}>Quasineutrality</h4>
          <p style={styles.text}>
            In a plasma, ion and electron densities should be approximately equal:
          </p>
          <div style={styles.formula}>
            Ratio = n<sub>e</sub> / n<sub>i</sub> ≈ 1.0
          </div>
          <p style={styles.text}>
            <strong>Good range:</strong> 0.8 - 1.2
          </p>
          <p style={styles.text}>
            <strong>Acceptable range:</strong> 0.5 - 2.0
          </p>
          
          <div style={styles.warningBox}>
            <strong>⚠️ Warning:</strong> Ratio outside 0.5-2.0 indicates:
            <ul style={styles.list}>
              <li>Poor data quality</li>
              <li>Incorrect parameter settings</li>
              <li>Non-equilibrium plasma conditions</li>
            </ul>
          </div>
        </Section>
        
        {/* Error Estimation */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Activity size={24} color="#F59E0B" />
            <h3 style={styles.cardTitle}>Error Estimation</h3>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Error Estimate</th>
                <th>Typical Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vp</td>
                <td>8% of Te</td>
                <td>±0.2 V</td>
              </tr>
              <tr>
                <td>Te</td>
                <td>15% of Te</td>
                <td>±0.3 eV</td>
              </tr>
              <tr>
                <td>ni, ne</td>
                <td>20% of density</td>
                <td>±2×10¹⁶ m⁻³</td>
              </tr>
              <tr>
                <td>Ratio</td>
                <td>Propagated error</td>
                <td>±0.05</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Troubleshooting */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Lightbulb size={24} color="#EF4444" />
            <h3 style={styles.cardTitle}>Troubleshooting</h3>
          </div>
          
          <div style={styles.troubleBox}>
            <h4 style={styles.troubleTitle}>❌ Problem: ni or ne is NaN</h4>
            <p style={styles.text}><strong>Possible Causes:</strong></p>
            <ul style={styles.list}>
              <li>Insufficient voltage range (need both negative and positive voltages)</li>
              <li>Incorrect probe radius or ion mass settings</li>
              <li>Poor quality data (too much noise)</li>
              <li>Data not covering saturation regions</li>
            </ul>
            <p style={styles.text}><strong>Solutions:</strong></p>
            <ul style={styles.list}>
              <li>Check data file format (2 columns: voltage, current)</li>
              <li>Ensure voltage range: -50V to +50V minimum</li>
              <li>Verify probe radius in Parameters page</li>
              <li>Use smoothed/filtered data</li>
            </ul>
          </div>
          
          <div style={styles.troubleBox}>
            <h4 style={styles.troubleTitle}>❌ Problem: Only 1 iteration, no convergence</h4>
            <p style={styles.text}><strong>Possible Causes:</strong></p>
            <ul style={styles.list}>
              <li>Initial Vp estimate very close to true value (rare)</li>
              <li>Learning rate too low</li>
              <li>Tolerance too loose</li>
            </ul>
            <p style={styles.text}><strong>Solutions:</strong></p>
            <ul style={styles.list}>
              <li>This is usually not a problem if results look reasonable</li>
              <li>Check console log (F12) for detailed iteration info</li>
              <li>Reduce tolerance in Parameters page (e.g., 1e-7)</li>
            </ul>
          </div>
          
          <div style={styles.troubleBox}>
            <h4 style={styles.troubleTitle}>❌ Problem: Ratio far from 1.0</h4>
            <p style={styles.text}><strong>Possible Causes:</strong></p>
            <ul style={styles.list}>
              <li>Non-Maxwellian electron distribution</li>
              <li>Magnetic field effects not properly accounted for</li>
              <li>Probe contamination or sheath expansion</li>
            </ul>
            <p style={styles.text}><strong>Solutions:</strong></p>
            <ul style={styles.list}>
              <li>Verify magnetic field strength in Parameters</li>
              <li>Check if probe is clean and undamaged</li>
              <li>Consider more advanced analysis methods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function Section({ icon, title, expanded, onToggle, children }) {
  return (
    <div style={styles.card}>
      <div 
        style={styles.sectionHeader} 
        onClick={onToggle}
      >
        <div style={styles.sectionTitleRow}>
          {icon}
          <h3 style={styles.cardTitle}>{title}</h3>
        </div>
        {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>
      
      {expanded && (
        <div style={styles.sectionContent}>
          {children}
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
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1A202C',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
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
    color: '#1A202C',
    margin: 0
  },
  text: {
    fontSize: '1rem',
    color: '#4A5568',
    lineHeight: '1.7',
    marginBottom: '1rem'
  },
  subTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1A202C',
    marginTop: '1.5rem',
    marginBottom: '0.75rem'
  },
  list: {
    paddingLeft: '1.5rem',
    color: '#4A5568',
    lineHeight: '1.8'
  },
  formula: {
    backgroundColor: '#EEF2FF',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    color: '#4C1D95',
    border: '2px solid #C7D2FE',
    margin: '1rem 0',
    lineHeight: '1.8'
  },
  codeBlock: {
    backgroundColor: '#1A202C',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#E2E8F0',
    margin: '1rem 0',
    overflowX: 'auto',
    whiteSpace: 'pre'
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    padding: '1rem',
    borderRadius: '8px',
    border: '2px solid #93C5FD',
    color: '#1E3A8A',
    marginTop: '1rem'
  },
  warningBox: {
    backgroundColor: '#FEE2E2',
    padding: '1rem',
    borderRadius: '8px',
    border: '2px solid #FCA5A5',
    color: '#991B1B',
    marginTop: '1rem'
  },
  flowDiagram: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'center'
  },
  flowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#F7FAFC',
    padding: '1rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '600px'
  },
  flowNumber: {
    width: '40px',
    height: '40px',
    backgroundColor: '#4F46E5',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  flowTitle: {
    fontWeight: '600',
    color: '#1A202C',
    fontSize: '1rem'
  },
  flowDesc: {
    fontSize: '0.875rem',
    color: '#718096'
  },
  flowArrow: {
    fontSize: '1.5rem',
    color: '#4F46E5',
    fontWeight: 'bold'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    userSelect: 'none'
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  sectionContent: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #F7FAFC'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem'
  },
  troubleBox: {
    backgroundColor: '#FEF3C7',
    padding: '1rem',
    borderRadius: '8px',
    border: '2px solid #FCD34D',
    marginBottom: '1rem'
  },
  troubleTitle: {
    color: '#92400E',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  }
};