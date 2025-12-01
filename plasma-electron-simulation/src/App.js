import React, { useState } from 'react';
import { Upload, Play, BarChart3, Settings, Info, Download, AlertCircle } from 'lucide-react';
import { runMonteCarloSimulation } from './simulation/electronSimulation';
import { loadCSVData } from './utils/dataLoader';

export default function PlasmaSimulationApp() {
  const [currentView, setCurrentView] = useState('intro');
  const [csvData, setCsvData] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    initialEnergy: 90,
    gasDensity: 3.22e22,
    plasmaVoltage: 15.0,
    numElectrons: 10000,
    chamberVolume: 0.001,
    wallArea: 0.1,
    timeStep: 1e-12,
    maxCollisions: 100
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // CSV 파일 업로드 핸들러
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await loadCSVData(file);
      setCsvData(data);
      setError(null);
      alert('✅ Cross Section 데이터가 성공적으로 로드되었습니다!');
    } catch (err) {
      setError('CSV 파일 로드 중 오류가 발생했습니다: ' + err.message);
      alert('❌ CSV 파일 로드 실패: ' + err.message);
    }
  };

  // 시뮬레이션 실행
  const runSimulation = async () => {
    if (!csvData) {
      alert('⚠️ 먼저 Cross Section CSV 파일을 업로드해주세요!');
      return;
    }

    setIsSimulating(true);
    setProgress(0);
    setError(null);

    try {
      const simulationResults = await runMonteCarloSimulation(
        csvData,
        simulationParams,
        (p) => setProgress(p)
      );

      setResults(simulationResults);
      setCurrentView('results');
    } catch (err) {
      setError('시뮬레이션 중 오류가 발생했습니다: ' + err.message);
      alert('❌ 시뮬레이션 실패: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // 결과 다운로드
  const downloadResults = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation_results_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Plasma Electron Simulation</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('intro')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  currentView === 'intro'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Info className="w-4 h-4" />
                소개
              </button>
              <button
                onClick={() => setCurrentView('simulation')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  currentView === 'simulation'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                시뮬레이션
              </button>
              {results && (
                <button
                  onClick={() => setCurrentView('results')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    currentView === 'results'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  결과
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-200">오류 발생</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'intro' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold mb-4">환영합니다! 👋</h1>
              <p className="text-xl text-white/80 mb-6">
                아르곤 플라즈마에서의 전자 충돌 및 이온화 과정을 시뮬레이션하는 웹 애플리케이션입니다.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-blue-500/20 p-6 rounded-lg border border-blue-400/30">
                  <h3 className="font-bold text-lg mb-2">🎯 Monte Carlo</h3>
                  <p className="text-sm text-white/80">
                    확률적 방법으로 전자의 궤적을 추적합니다
                  </p>
                </div>
                <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-400/30">
                  <h3 className="font-bold text-lg mb-2">⚡ BEB 모델</h3>
                  <p className="text-sm text-white/80">
                    이론적 단면적 계산을 지원합니다
                  </p>
                </div>
                <div className="bg-green-500/20 p-6 rounded-lg border border-green-400/30">
                  <h3 className="font-bold text-lg mb-2">📊 실시간 분석</h3>
                  <p className="text-sm text-white/80">
                    결과를 즉시 시각화하여 제공합니다
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">시작하기 전에</h3>
                  <p className="text-white/90">
                    시뮬레이션을 시작하려면 <strong>Cross Section CSV 파일</strong>을 업로드해야 합니다.
                    파일은 Energy, 1S, 2P, HIGH, IZ 열을 포함해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('simulation')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/50"
            >
              시뮬레이션 시작하기
              <Play className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentView === 'simulation' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* File Upload */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  데이터 파일 업로드
                </h2>
                
                <label className="block">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    csvData
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-white/30 hover:border-white/50 bg-white/5'
                  }`}>
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium mb-1">
                      {csvData ? '✅ 파일 로드됨' : 'CSV 파일 선택'}
                    </p>
                    <p className="text-sm text-white/60">
                      Biagi Cross Section Data
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </label>

                {csvData && (
                  <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                    <p className="text-sm">
                      <strong>데이터 포인트:</strong> {csvData.energy.length}개
                    </p>
                    <p className="text-sm">
                      <strong>에너지 범위:</strong> {csvData.energy[0].toFixed(1)} - {csvData.energy[csvData.energy.length - 1].toFixed(1)} eV
                    </p>
                  </div>
                )}
              </div>

              {/* Parameters */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  시뮬레이션 파라미터
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">초기 전자 에너지 (eV)</label>
                    <input
                      type="number"
                      value={simulationParams.initialEnergy}
                      onChange={(e) => setSimulationParams({
                        ...simulationParams,
                        initialEnergy: parseFloat(e.target.value)
                      })}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">가스 밀도 (m⁻³)</label>
                    <input
                      type="text"
                      value={simulationParams.gasDensity.toExponential(2)}
                      onChange={(e) => setSimulationParams({
                        ...simulationParams,
                        gasDensity: parseFloat(e.target.value)
                      })}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">플라즈마 전위 (V)</label>
                    <input
                      type="number"
                      value={simulationParams.plasmaVoltage}
                      onChange={(e) => setSimulationParams({
                        ...simulationParams,
                        plasmaVoltage: parseFloat(e.target.value)
                      })}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">시뮬레이션 전자 수</label>
                    <input
                      type="number"
                      value={simulationParams.numElectrons}
                      onChange={(e) => setSimulationParams({
                        ...simulationParams,
                        numElectrons: parseInt(e.target.value)
                      })}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 h-full flex flex-col items-center justify-center">
                {!isSimulating && (
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Play className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">시뮬레이션 준비 완료</h2>
                    <p className="text-white/70 mb-8">
                      설정을 확인하고 시뮬레이션을 실행하세요
                    </p>
                    <button
                      onClick={runSimulation}
                      disabled={!csvData}
                      className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition-all ${
                        csvData
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/50'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      시뮬레이션 시작
                    </button>
                  </div>
                )}

                {isSimulating && (
                  <div className="text-center w-full max-w-md">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 border-8 border-blue-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{progress}%</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">시뮬레이션 진행 중...</h2>
                    <p className="text-white/70 mb-6">
                      {simulationParams.numElectrons}개의 전자를 시뮬레이션하고 있습니다
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'results' && results && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-400/30">
                <p className="text-sm text-white/70 mb-1">평균 이온화 수</p>
                <p className="text-3xl font-bold">{results.avgIonizations.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
                <p className="text-sm text-white/70 mb-1">최대 이온화</p>
                <p className="text-3xl font-bold">{results.maxIonizations}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-purple-400/30">
                <p className="text-sm text-white/70 mb-1">평균 충돌 수</p>
                <p className="text-3xl font-bold">{results.avgCollisions.toFixed(1)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-orange-400/30">
                <p className="text-sm text-white/70 mb-1">벽 흡수율</p>
                <p className="text-3xl font-bold">{(results.wallAbsorptionRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Histogram */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h2 className="text-xl font-bold mb-6">이온화 분포 히스토그램</h2>
              <div className="h-64 bg-white/5 rounded-lg flex items-end justify-around p-4 gap-1">
                {results.ionizationDistribution.map((count, index) => {
                  const maxCount = Math.max(...results.ionizationDistribution);
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                      <div className="text-xs text-white/60 mb-1">{count}</div>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all"
                        style={{ height: `${height}%`, minHeight: count > 0 ? '2px' : '0' }}
                      ></div>
                      <span className="text-xs mt-2">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('simulation')}
                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium transition-all border border-white/20"
              >
                새 시뮬레이션
              </button>
              <button
                onClick={downloadResults}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                결과 다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}