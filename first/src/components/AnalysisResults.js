import React from 'react';
import ResultsCard from './ResultsCard';
import AnalysisMethodology from './AnalysisMethodology';
import IVCurveChart from './Charts/IVCurveChart';
import DerivativeChart from './Charts/DerivativeChart';
import ElectronCurrentChart from './Charts/ElectronCurrentChart';
import EEDFChart from './Charts/EEDFChart';

const AnalysisResults = ({ rawData, results, ionSaturationVoltage }) => {
  const voltage = rawData.map(d => d.voltage);
  const current = rawData.map(d => d.current);

  return (
    <div className="space-y-8">
      {/* Analysis Methodology - 접을 수 있는 섹션 */}
      <AnalysisMethodology />

      {/* Summary Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Analysis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultsCard 
            title="Plasma Potential" 
            value={results.Vp} 
            unit="V"
          />
          <ResultsCard 
            title="Electron Temperature" 
            value={results.Te} 
            unit="eV"
          />
          <ResultsCard 
            title="Ion Density" 
            value={results.ni} 
            unit="m⁻³"
          />
          <ResultsCard 
            title="Electron Density" 
            value={results.ne} 
            unit="m⁻³"
          />
        </div>
      </div>

      {/* Additional Parameters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-3">Additional Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Ion Saturation Current:</span>
            <p className="font-semibold text-lg">{results.iSat.toExponential(2)} A</p>
          </div>
          <div>
            <span className="text-gray-600">Electron Sat. Current:</span>
            <p className="font-semibold text-lg">{results.Ip.toExponential(2)} A</p>
          </div>
          <div>
            <span className="text-gray-600">CL Coefficient (a):</span>
            <p className="font-semibold text-lg">{results.a.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Sheath expansion parameter</p>
          </div>
          <div>
            <span className="text-gray-600">Density Ratio (n_i/n_e):</span>
            <p className="font-semibold text-lg">{results.ratio.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Quasi-neutrality check</p>
          </div>
        </div>
      </div>

      {/* Ion Current Fitting Model Info */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border-l-4 border-red-500">
        <h3 className="font-bold text-lg mb-2 text-red-800">
          🔬 Ion Current Fitting Model: Chen-Luhmann (CL) Model
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            이온 전류는 <strong>Chen-Luhmann (CL) 모델</strong>을 사용하여 피팅됩니다:
          </p>
          <div className="bg-white p-3 rounded border border-red-200 font-mono text-sm">
            I<sub>ion</sub>(V) = I<sub>sat</sub> × [1 + a × |V<sub>p</sub> - V|<sup>0.75</sup> / T<sub>e</sub><sup>0.75</sup>]
          </div>
          <ul className="ml-4 space-y-1">
            <li>• <strong>적용 영역:</strong> V &lt; {ionSaturationVoltage} V (이온 포화 영역)</li>
            <li>• <strong>I<sub>sat</sub></strong> = {results.iSat.toExponential(2)} A (이온 포화 전류)</li>
            <li>• <strong>a</strong> = {results.a.toFixed(2)} (CL 계수, sheath expansion parameter)</li>
            <li>• 이 모델은 sheath expansion 효과를 물리적으로 고려합니다</li>
          </ul>
        </div>
      </div>

      {/* Iteration History */}
      {results.iterationHistory && results.iterationHistory.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-2 text-blue-800">🔄 Convergence History</h3>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Converged in {results.iterationHistory.length} iterations</strong>
            {' '}(Tolerance: 10<sup>-5</sup> V)
          </p>
          <div className="bg-white rounded p-3 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-300">
                <tr className="text-left">
                  <th className="py-1 px-2">Iteration</th>
                  <th className="py-1 px-2">V<sub>p</sub> (V)</th>
                  <th className="py-1 px-2">|ΔV<sub>p</sub>| (V)</th>
                  <th className="py-1 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.iterationHistory.map((iter, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-1 px-2">{iter.iteration}</td>
                    <td className="py-1 px-2 font-mono">{iter.Vp.toFixed(2)}</td>
                    <td className="py-1 px-2 font-mono">{iter.difference.toExponential(2)}</td>
                    <td className="py-1 px-2">
                      {iter.difference < 1e-5 ? 
                        <span className="text-green-600 font-semibold">✓ Converged</span> : 
                        <span className="text-gray-500">Iterating...</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        <IVCurveChart 
          rawData={rawData}
          ionFit={results.iIonFit}
          electronFit={results.iElectronFit}
          Vp={results.Vp}
        />
        
        <DerivativeChart 
          voltage={voltage}
          dIdV={results.dIdV}
          Vp={results.Vp}
        />
        
        <ElectronCurrentChart 
          voltage={voltage}
          electronCurrent={results.iElectronFit}
          Vp={results.Vp}
          Ip={results.Ip}
        />
        
        {results.eedfData && results.eedfData.length > 0 && (
          <EEDFChart eedfData={results.eedfData} />
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;