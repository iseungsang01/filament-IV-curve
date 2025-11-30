import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const EEDFChart = ({ eedfData }) => {
  const sortedData = [...eedfData].sort((a, b) => a.energy - b.energy);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Electron Energy Distribution Function (EEDF)
      </h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={sortedData} margin={{ top: 10, right: 40, left: 80, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="energy" 
            domain={[0, 'dataMax']}
            label={{ 
              value: 'Electron Energy (eV)', 
              position: 'insideBottom', 
              offset: -20, 
              style: { 
                fontFamily: 'Times New Roman', 
                fontSize: 16, 
                fontWeight: 'bold',
                fill: '#000'
              } 
            }}
            style={{ fontFamily: 'Times New Roman', fontSize: 14 }}
            tick={{ fill: '#000' }}
            tickFormatter={(value) => value.toFixed(0)}
            stroke="#000"
            strokeWidth={1.5}
          />
          <YAxis 
            scale="log" 
            domain={['auto', 'auto']}
            label={{ 
              value: 'EEDF (d²I/dV²)', 
              angle: -90, 
              position: 'insideLeft', 
              offset: 20,
              style: { 
                fontFamily: 'Times New Roman', 
                fontSize: 16, 
                fontWeight: 'bold',
                fill: '#000'
              } 
            }}
            style={{ fontFamily: 'Times New Roman', fontSize: 14 }}
            tick={{ fill: '#000' }}
            tickFormatter={(value) => value.toExponential(0)}
            stroke="#000"
            strokeWidth={1.5}
          />
          <Tooltip 
            formatter={(value) => [value.toExponential(3), 'EEDF']}
            labelFormatter={(value) => `Energy = ${parseFloat(value).toFixed(2)} eV`}
            contentStyle={{ 
              fontFamily: 'Times New Roman',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #000',
              borderRadius: '4px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'Times New Roman', fontSize: 14 }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#dc2626" 
            dot={false} 
            strokeWidth={2.5} 
            name="EEDF (Druyvesteyn Method)" 
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Calculated from second derivative of electron current (d²I/dV²)</p>
      </div>
    </div>
  );
};

export default EEDFChart;