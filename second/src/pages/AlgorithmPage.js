// ============================================
// src/pages/AlgorithmPage.js (개선 버전)
// Child-Langmuir 모델 및 개선된 알고리즘 설명 추가
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
            This tool uses an <strong>improved iterative algorithm</strong> combining Child-Langmuir ion current modeling
            with dual-region linear regression for precise extraction of plasma parameters: 
            <strong>Plasma Potential (Vp)</strong>, <strong>Electron Temperature (Te)</strong>,
            and <strong>Ion/Electron Densities (ni, ne)</strong>.
          </p>
          <div style={styles.infoBox}>
            <strong>🔬 Key Improvements:</strong>
            <ul style={styles.list}>
              <li>Child-Langmuir model for ion saturation current (a=1.02)</li>
              <li>Dual-region (transition + saturation) linear regression for Vp/Te</li>
              <li>Error propagation for all fitted parameters</li>
              <li>Improved density calculation coefficients (0.61 for ions)</li>
            </ul>
          </div>
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
              { num: 2, title: 'Initial Estimation', desc: 'Estimate Vp, Isat, Ies using dI/dV' },
              { num: 3, title: 'Ion Current Modeling', desc: 'Apply Child-Langmuir model' },
              { num: 4, title: 'Dual-Region Fitting', desc: 'Extract Vp/Te from line intersections' },
              { num: 5, title: 'Iterative Refinement', desc: 'Converge Vp and Te with damping' },
              { num: 6, title: 'Density Calculation', desc: 'Compute ni and ne with error bars' },
              { num: 7, title: 'Validation', desc: 'Check quasineutrality and physical ranges' }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={styles.flowStep}>
                  <div style={styles.flowNumber}>{step.num}</div>
                  <div>
                    <div style={styles.flowTitle}>{step.title}</div>
                    <div style={styles.flowDesc}>{step.desc}</div>
                  </div>
                </div>
                {idx < 6 && <div style={styles.flowArrow}>↓</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Detailed Algorithms */}
        <Section
          icon={<Code size={24} color="#10B981" />}
          title="Step 1-2: Initial Parameter Estimation"
          expanded={expandedSections.step1}
          onToggle={() => toggleSection('step1')}
        >
          <h4 style={styles.subTitle}>A. Ion Saturation Current (Isat)</h4>
          <p style={styles.text}>
            Average current in the lowest 20% voltage region (most negative voltages).
          </p>
          <div style={styles.formula}>
            I<sub>sat</sub> = Average(|I|) for V in [V<sub>min</sub>, V<sub>min</sub> + 20%]
          </div>
          
          <h4 style={styles.subTitle}>B. Electron Saturation Current (Ies)</h4>
          <p style={styles.text}>
            Average current in the highest 20% voltage region.
          </p>
          <div style={styles.formula}>
            I<sub>es</sub> = Average(I) for V in [V<sub>max</sub> - 20%, V<sub>max</sub>]
          </div>
          
          <h4 style={styles.subTitle}>C. Initial Plasma Potential (Vp)</h4>
          <p style={styles.text}>
            Voltage where |dI/dV| is maximum (using central difference method).
          </p>
          <div style={styles.formula}>
            dI/dV = (I[i+2] - I[i-2]) / (V[i+2] - V[i-2])
            <br />
            V<sub>p,initial</sub> = V where |dI/dV| is maximum
          </div>
        </Section>
        
        <Section
          icon={<Cpu size={24} color="#EC4899" />}
          title="Step 3: Child-Langmuir Ion Current Model"
          expanded={expandedSections.step3}
          onToggle={() => toggleSection('step3')}
        >
          <h4 style={styles.subTitle}>Physical Background</h4>
          <p style={styles.text}>
            In the ion saturation region (V &lt; Vp), the sheath around the probe expands,
            collecting more ions. The Child-Langmuir law models this effect.
          </p>
          
          <h4 style={styles.subTitle}>Model Equation</h4>
          <div style={styles.formula}>
            I<sub>ion</sub>(V) = I<sub>sat</sub> × [1 + a × ((V<sub>p</sub> - V) / T<sub>e</sub>)<sup>0.75</sup>]
            <br /><br />
            where:
            <br />
            • a = 1.02 (sheath expansion coefficient, empirical)
            <br />
            • V<sub>p</sub> = plasma potential
            <br />
            • T<sub>e</sub> = electron temperature (in eV)
          </div>
          
          <div style={styles.infoBox}>
            <strong>💡 Key Point:</strong> The coefficient a=1.02 is based on standard probe theory
            and accounts for the sheath geometry effect. This is more accurate than simple linear models.
          </div>
        </Section>
        
        <Section
          icon={<Activity size={24} color="#7C3AED" />}
          title="Step 4: Dual-Region Linear Regression for Vp/Te"
          expanded={expandedSections.step4}
          onToggle={() => toggleSection('step4')}
        >
          <h4 style={styles.subTitle}>Method Overview</h4>
          <p style={styles.text}>
            This is the <strong>most critical improvement</strong>. Instead of fitting a single region,
            we fit TWO separate linear regions in log(I<sub>e</sub>) vs V space and find their intersection.
          </p>
          
          <h4 style={styles.subTitle}>Step-by-Step Process</h4>
          <ol style={styles.list}>
            <li><strong>Separate electron current:</strong> I<sub>e</sub> = I<sub>total</sub> - I<sub>ion,model</sub></li>
            <li><strong>Take logarithm:</strong> ln(I<sub>e</sub>) for positive currents only</li>
            <li><strong>Define Region 1 (Transition):</strong> V<sub>p</sub> - 2V &lt; V &lt; V<sub>p</sub></li>
            <li><strong>Define Region 2 (Saturation):</strong> V<sub>p</sub> + 0.5V &lt; V &lt; V<sub>p</sub> + 5V</li>
            <li><strong>Linear fit each region:</strong>
              <div style={styles.formula}>
                Region 1: ln(I<sub>e</sub>) = m₁V + c₁
                <br />
                Region 2: ln(I<sub>e</sub>) = m₂V + c₂
              </div>
            </li>
            <li><strong>Find intersection (Vp):</strong>
              <div style={styles.formula}>
                V<sub>p</sub> = (c₂ - c₁) / (m₁ - m₂)
              </div>
            </li>
            <li><strong>Extract Te from slope:</strong>
              <div style={styles.formula}>
                T<sub>e</sub> = 1 / m₁ (in eV)
              </div>
            </li>
            <li><strong>Extract Ies:</strong>
              <div style={styles.formula}>
                I<sub>es</sub> = exp(m₁V<sub>p</sub> + c₁)
              </div>
            </li>
          </ol>
          
          <div style={styles.warningBox}>
            <strong>⚠️ Why Two Regions?</strong>
            <ul style={styles.list}>
              <li>Transition region: steep slope → sensitive to Te</li>
              <li>Saturation region: flat slope → marks true electron saturation</li>
              <li>Intersection = physical definition of Vp</li>
            </ul>
          </div>
        </Section>
        
        <Section
          icon={<Cpu size={24} color="#EF4444" />}
          title="Step 5: Iterative Refinement"
          expanded={expandedSections.step5}
          onToggle={() => toggleSection('step5')}
        >
          <h4 style={styles.subTitle}>Convergence Algorithm</h4>
          <div style={styles.codeBlock}>
            <code>{`for iteration = 0 to maxIterations:
    1. Estimate Vp/Te using dual-region method
    2. Update with damping factor (0.6):
       Vp_new = 0.6 × Vp_old + 0.4 × Vp_estimated
       Te_new = 0.6 × Te_old + 0.4 × Te_estimated
    3. Check convergence: |Vp_new - Vp_old| < tolerance
    4. If converged, break
    
Typical convergence: 10-30 iterations
Default tolerance: 1e-6 V`}</code>
          </div>
          
          <div style={styles.infoBox}>
            <strong>💡 Damping Factor:</strong> The 0.6/0.4 ratio prevents oscillations
            and ensures smooth convergence, especially for noisy data.
          </div>
        </Section>
        
        <Section
          icon={<Activity size={24} color="#10B981" />}
          title="Step 6: Density Calculation with Error Propagation"
          expanded={expandedSections.step6}
          onToggle={() => toggleSection('step6')}
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
            • 0.61 = Bohm sheath coefficient (improved from 0.6)
          </div>
          
          <p style={styles.text}><strong>Error propagation:</strong></p>
          <div style={styles.formula}>
            δn<sub>i</sub> / n<sub>i</sub> = √[(δI<sub>sat</sub>/I<sub>sat</sub>)² + (0.5 × δT<sub>e</sub>/T<sub>e</sub>)²]
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
          
          <p style={styles.text}><strong>Error propagation:</strong></p>
          <div style={styles.formula}>
            δn<sub>e</sub> / n<sub>e</sub> = √[(δI<sub>es</sub>/I<sub>es</sub>)² + (0.5 × δT<sub>e</sub>/T<sub>e</sub>)²]
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
          title="Step 7: Validation & Quasineutrality"
          expanded={expandedSections.step7}
          onToggle={() => toggleSection('step7')}
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
        
        {/* Comparison Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Activity size={24} color="#F59E0B" />
            <h3 style={styles.cardTitle}>Algorithm Comparison</h3>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Previous Version</th>
                <th>Improved Version</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ion Current Model</td>
                <td>Simple average</td>
                <td>Child-Langmuir (a=1.02)</td>
              </tr>
              <tr>
                <td>Vp Estimation</td>
                <td>dI/dV maximum only</td>
                <td>Dual-region line intersection</td>
              </tr>
              <tr>
                <td>Te Estimation</td>
                <td>Single region fit</td>
                <td>Transition region slope</td>
              </tr>
              <tr>
                <td>Ion Density Coeff</td>
                <td>0.60</td>
                <td>0.61 (Bohm theory)</td>
              </tr>
              <tr>
                <td>Error Estimation</td>
                <td>Fixed percentages</td>
                <td>Propagated from regression</td>
              </tr>
              <tr>
                <td>Convergence</td>
                <td>Gradient descent</td>
                <td>Damped iterative refinement</td>
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
              <li>Insufficient voltage range (need -50V to +50V minimum)</li>
              <li>Incorrect probe radius or ion mass settings</li>
              <li>Data doesn't cover both ion and electron saturation regions</li>
              <li>Too much noise in the data</li>
            </ul>
            <p style={styles.text}><strong>Solutions:</strong></p>
            <ul style={styles.list}>
              <li>Verify data file has two columns: voltage, current</li>
              <li>Check voltage range covers both negative and positive regions</li>
              <li>Verify probe radius in Parameters page (typical: 0.3-1.0 mm)</li>
              <li>Try smoothing/filtering raw data before upload</li>
            </ul>
          </div>
          
          <div style={styles.troubleBox}>
            <h4 style={styles.troubleTitle}>❌ Problem: Ratio far from 1.0</h4>
            <p style={styles.text}><strong>Possible Causes:</strong></p>
            <ul style={styles.list}>
              <li>Non-Maxwellian electron distribution</li>
              <li>Magnetic field effects not accounted for</li>
              <li>Probe contamination or damage</li>
              <li>Incorrect ion mass selection</li>
            </ul>
            <p style={styles.text}><strong>Solutions:</strong></p>
            <ul style={styles.list}>
              <li>Verify magnetic field strength in Parameters</li>
              <li>Check probe is clean and cylindrical</li>
              <li>Confirm correct ion species (Ar, He, etc.)</li>
              <li>Consider advanced analysis methods for non-ideal plasmas</li>
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