// 차트 표시 컴포넌트
// Recharts를 사용한 고급 차트 시각화

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * 단면적 차트
 */
export const CrossSectionChart = ({ csvData }) => {
  if (!csvData) return null;

  const data = csvData.energy.map((e, i) => ({
    energy: e,
    '1S': csvData.sigma_1s[i],
    '2P': csvData.sigma_2p[i],
    'HIGH': csvData.sigma_high[i],
    'IZ': csvData.sigma_iz[i]
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold mb-4">충돌 단면적 vs 에너지</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="energy" 
            stroke="#fff" 
            label={{ value: 'Energy (eV)', position: 'insideBottom', offset: -5, fill: '#fff' }}
          />
          <YAxis 
            stroke="#fff"
            label={{ value: 'Cross Section (Å²)', angle: -90, position: 'insideLeft', fill: '#fff' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey="1S" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="2P" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="HIGH" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="IZ" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 이온화 분포 막대 차트
 */
export const IonizationDistributionChart = ({ distribution }) => {
  if (!distribution) return null;

  const data = distribution.map((count, index) => ({
    ionizations: index,
    count: count
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold mb-4">이온화 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="ionizations" 
            stroke="#fff"
            label={{ value: '이온화 수', position: 'insideBottom', offset: -5, fill: '#fff' }}
          />
          <YAxis 
            stroke="#fff"
            label={{ value: '전자 수', angle: -90, position: 'insideLeft', fill: '#fff' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 에너지 분포 차트
 */
export const EnergyDistributionChart = ({ electrons }) => {
  if (!electrons || electrons.length === 0) return null;

  // 에너지를 구간으로 나누기
  const energies = electrons.map(e => e.finalEnergy);
  const maxEnergy = Math.max(...energies);
  const numBins = 20;
  const binWidth = maxEnergy / numBins;
  
  const bins = new Array(numBins).fill(0);
  energies.forEach(e => {
    const binIndex = Math.min(Math.floor(e / binWidth), numBins - 1);
    bins[binIndex]++;
  });

  const data = bins.map((count, i) => ({
    energy: (i * binWidth).toFixed(1),
    count: count
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold mb-4">최종 에너지 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="energy" 
            stroke="#fff"
            label={{ value: '에너지 (eV)', position: 'insideBottom', offset: -5, fill: '#fff' }}
          />
          <YAxis 
            stroke="#fff"
            label={{ value: '전자 수', angle: -90, position: 'insideLeft', fill: '#fff' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 충돌 타입 분포 파이 차트 (간단한 막대로 표현)
 */
export const CollisionTypeChart = ({ electrons }) => {
  if (!electrons || electrons.length === 0) return null;

  const collisionTypes = {
    elastic: 0,
    excitation: 0,
    ionization: 0
  };

  electrons.forEach(e => {
    if (e.collisionHistory) {
      e.collisionHistory.forEach(c => {
        if (c.type === 'elastic') collisionTypes.elastic++;
        else if (c.type === 'ionization') collisionTypes.ionization++;
        else collisionTypes.excitation++;
      });
    }
  });

  const data = [
    { type: '탄성 충돌', count: collisionTypes.elastic, fill: '#3b82f6' },
    { type: '여기', count: collisionTypes.excitation, fill: '#f59e0b' },
    { type: '이온화', count: collisionTypes.ionization, fill: '#ef4444' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold mb-4">충돌 타입 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis type="number" stroke="#fff" />
          <YAxis dataKey="type" type="category" stroke="#fff" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  CrossSectionChart,
  IonizationDistributionChart,
  EnergyDistributionChart,
  CollisionTypeChart
};