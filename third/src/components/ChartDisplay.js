import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ChartDisplay Component
 * 시뮬레이션 결과를 다양한 차트로 시각화
 */
export default function ChartDisplay({ data, type = 'histogram' }) {
  
  // 히스토그램 차트
  const renderHistogram = () => {
    if (!data || !data.ionizations) return null;

    // 이온화 횟수별 빈도 계산
    const histogram = {};
    data.ionizations.forEach(count => {
      histogram[count] = (histogram[count] || 0) + 1;
    });

    const chartData = Object.entries(histogram).map(([ionCount, frequency]) => ({
      ionizations: parseInt(ionCount),
      frequency: frequency,
      percentage: ((frequency / data.ionizations.length) * 100).toFixed(1)
    }));

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">이온화 분포 히스토그램</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="ionizations" 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: '이온화 횟수', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: '빈도', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              formatter={(value, name) => {
                if (name === 'frequency') return [value, '전자 수'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="frequency" fill="#3b82f6" name="전자 수" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 에너지 분포 차트
  const renderEnergyDistribution = () => {
    if (!data || !data.energyDistribution) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">에너지 분포</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.energyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="energy" 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: 'Energy (eV)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="전자 수"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Cross Section 차트
  const renderCrossSection = () => {
    if (!data || !data.energy) return null;

    const chartData = data.energy.map((energy, idx) => ({
      energy: energy,
      sigma_1s: data.sigma_1s[idx],
      sigma_2p: data.sigma_2p[idx],
      sigma_high: data.sigma_high[idx],
      sigma_iz: data.sigma_iz[idx]
    }));

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Cross Section Data</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="energy" 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: 'Energy (eV)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              label={{ value: 'Cross Section (m²)', angle: -90, position: 'insideLeft' }}
              scale="log"
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sigma_1s" stroke="#ef4444" strokeWidth={2} dot={false} name="1S" />
            <Line type="monotone" dataKey="sigma_2p" stroke="#3b82f6" strokeWidth={2} dot={false} name="2P" />
            <Line type="monotone" dataKey="sigma_high" stroke="#10b981" strokeWidth={2} dot={false} name="HIGH" />
            <Line type="monotone" dataKey="sigma_iz" stroke="#f59e0b" strokeWidth={2} dot={false} name="IZ" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 차트 타입에 따라 렌더링
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      {type === 'histogram' && renderHistogram()}
      {type === 'energy' && renderEnergyDistribution()}
      {type === 'crossSection' && renderCrossSection()}
    </div>
  );
}