import React from 'react';
import ResultsCard from './ResultsCard';
import IVCurveChart from './Charts/IVCurveChart';
import DerivativeChart from './Charts/DerivativeChart';
import ElectronCurrentChart from './Charts/ElectronCurrentChart';
import EEDFChart from './Charts/EEDFChart';

const AnalysisResults = ({ rawData, results }) => {
  const voltage = rawData.map(d => d.voltage);
  const current = rawData.map(d => d.current);

  return (
    <div className="space-y-8">
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
        <h3 className="font-bold text-lg mb-2">Additional Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Ion Saturation Current:</span>
            <p className="font-semibold">{results.iSat.toExponential(3)} A</p>
          </div>
          <div>
            <span className="text-gray-600">Electron Sat. Current:</span>
            <p className="font-semibold">{results.Ip.toExponential(3)} A</p>
          </div>
          <div>
            <span className="text-gray-600">CL Coefficient (a):</span>
            <p className="font-semibold">{results.a.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-gray-600">Density Ratio (n_i/n_e):</span>
            <p className="font-semibold">{results.ratio.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Iteration History */}
      {results.iterationHistory && results.iterationHistory.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Convergence History</h3>
          <p className="text-sm text-gray-700">
            Converged in {results.iterationHistory.length} iterations
          </p>
          <div className="mt-2 space-y-1">
            {results.iterationHistory.map((iter, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                Iteration {iter.iteration}: Vp = {iter.Vp.toFixed(4)} V (Δ = {iter.difference.toExponential(2)})
              </div>
            ))}
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