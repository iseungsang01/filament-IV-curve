import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const EEDFChart = ({ eedfData }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">EEDF (Electron Energy Distribution Function)</h3>
      <p className="text-sm text-gray-600 mb-3">
        Calculated from d²I/dV² - Shows electron energy distribution in the plasma
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={eedfData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="energy" 
            label={{ value: 'Electron Energy ε (eV)', position: 'insideBottom', offset: -10, style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <YAxis 
            scale="log" 
            domain={['auto', 'auto']}
            label={{ value: 'd²I/dV² (A/V²)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
            tickFormatter={(value) => value.toExponential(0)}
          />
          <Tooltip 
            formatter={(value) => value.toExponential(3)}
            contentStyle={{ fontFamily: 'Times New Roman' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Times New Roman' }} />
          <Line type="monotone" dataKey="value" stroke="#ef4444" dot={false} strokeWidth={2} name="EEDF" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EEDFChart;