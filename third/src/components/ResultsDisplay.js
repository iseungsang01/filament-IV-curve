import React from 'react';
import { Download, TrendingUp, Zap, BarChart3, Activity } from 'lucide-react';
import ChartDisplay from './ChartDisplay';
import { formatScientific, formatWithUnit, downloadJSON, downloadCSV, arrayToCSV } from '../utils/helpers';

/**
 * ResultsDisplay Component
 * 시뮬레이션 결과 표시 및 분석
 */
export default function ResultsDisplay({ results, onNewSimulation, onDownload }) {
  
  if (!results || !results.statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">결과 데이터가 없습니다.</p>
      </div>
    );
  }
  
  const stats = results.statistics;
  
  // 결과 다운로드 핸들러
  const handleDownloadJSON = () => {
    downloadJSON(results, `simulation_results_${Date.now()}.json`);
  };
  
  const handleDownloadCSV = () => {
    // 이온화 데이터를 CSV로 변환
    const csvData = results.ionizations.map((count, index) => ({
      electronIndex: index + 1,
      ionizationCount: count,
      excitationCount: results.excitations[index],
      energyLoss: results.energyLosses[index].toFixed(2),
      collisions: results.collisionCounts[index]
    }));
    
    const csvText = arrayToCSV(csvData, [
      'electronIndex',
      'ionizationCount',
      'excitationCount',
      'energyLoss',
      'collisions'
    ]);
    
    downloadCSV(csvText, `simulation_results_${Date.now()}.csv`);
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          title="평균 이온화"
          value={stats.ionization.mean.toFixed(2)}
          subtitle={`σ = ${stats.ionization.std.toFixed(2)}`}
          color="blue"
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="최대 이온화"
          value={stats.ionization.max}
          subtitle={`최소: ${stats.ionization.min}`}
          color="green"
        />
        
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="총 이온화"
          value={stats.ionization.total.toLocaleString()}
          subtitle="전체 전자"
          color="purple"
        />
        
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="생존율"
          value={`${(stats.survivalRate * 100).toFixed(1)}%`}
          subtitle={`${Math.round(stats.survivalRate * results.ionizations.length)} 전자`}
          color="orange"
        />
      </div>
      
      {/* Detailed Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ionization Statistics */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            이온화 통계
          </h3>
          
          <div className="space-y-3">
            <StatRow label="평균" value={stats.ionization.mean.toFixed(3)} />
            <StatRow label="표준편차" value={stats.ionization.std.toFixed(3)} />
            <StatRow label="최대값" value={stats.ionization.max} />
            <StatRow label="최소값" value={stats.ionization.min} />
            <StatRow label="총 이온화" value={stats.ionization.total.toLocaleString()} />
          </div>
        </div>
        
        {/* Excitation Statistics */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            여기 통계
          </h3>
          
          <div className="space-y-3">
            <StatRow label="평균 여기" value={stats.excitation.mean.toFixed(3)} />
            <StatRow label="표준편차" value={stats.excitation.std.toFixed(3)} />
            <StatRow label="총 여기" value={stats.excitation.total.toLocaleString()} />
          </div>
        </div>
        
        {/* Energy Loss Statistics */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            에너지 손실
          </h3>
          
          <div className="space-y-3">
            <StatRow label="평균 손실" value={`${stats.energyLoss.mean.toFixed(2)} eV`} />
            <StatRow label="표준편차" value={`${stats.energyLoss.std.toFixed(2)} eV`} />
          </div>
        </div>
        
        {/* Collision Statistics */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            충돌 통계
          </h3>
          
          <div className="space-y-3">
            <StatRow label="평균 충돌" value={stats.collisions.mean.toFixed(1)} />
            <StatRow label="표준편차" value={stats.collisions.std.toFixed(1)} />
            <StatRow label="최대 충돌" value={stats.collisions.max} />
            <StatRow label="최소 충돌" value={stats.collisions.min} />
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <ChartDisplay 
        data={{
          ionizations: results.ionizations
        }}
        type="histogram"
      />
      
      {/* Distribution Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-bold mb-4">이온화 분포 분석</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-1">이온화 0회</p>
            <p className="text-2xl font-bold">
              {results.ionizations.filter(x => x === 0).length}
            </p>
            <p className="text-xs text-white/60">
              ({((results.ionizations.filter(x => x === 0).length / results.ionizations.length) * 100).toFixed(1)}%)
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-1">이온화 1-3회</p>
            <p className="text-2xl font-bold">
              {results.ionizations.filter(x => x >= 1 && x <= 3).length}
            </p>
            <p className="text-xs text-white/60">
              ({((results.ionizations.filter(x => x >= 1 && x <= 3).length / results.ionizations.length) * 100).toFixed(1)}%)
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-1">이온화 4회 이상</p>
            <p className="text-2xl font-bold">
              {results.ionizations.filter(x => x >= 4).length}
            </p>
            <p className="text-xs text-white/60">
              ({((results.ionizations.filter(x => x >= 4).length / results.ionizations.length) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewSimulation}
          className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium transition-all border border-white/20"
        >
          새 시뮬레이션
        </button>
        
        <button
          onClick={handleDownloadJSON}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          JSON 다운로드
        </button>
        
        <button
          onClick={handleDownloadCSV}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          CSV 다운로드
        </button>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, title, value, subtitle, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
    green: 'from-green-500/20 to-green-600/20 border-green-400/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-400/30'
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md rounded-xl p-6 border`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm text-white/70">{title}</p>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs text-white/60">{subtitle}</p>
    </div>
  );
}

/**
 * Stat Row Component
 */
function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <span className="text-sm text-white/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}