import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const IVCurveChart = ({ rawData, ionFit, electronFit, Vp }) => {
  const combinedData = rawData.map((d, i) => ({
    voltage: d.voltage,
    total: d.current,
    ion: ionFit[i],
    electron: electronFit[i]
  })).sort((a, b) => a.voltage - b.voltage);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Current Separation: Total, Ion, and Electron Components
      </h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={combinedData} margin={{ top: 10, right: 40, left: 80, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="voltage" 
            domain={['dataMin', 'dataMax']}
            label={{ 
              value: 'Probe Voltage (V)', 
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
            label={{ 
              value: 'Current (A)', 
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
            tickFormatter={(value) => value.toExponential(1)}
            stroke="#000"
            strokeWidth={1.5}
          />
          <Tooltip 
            formatter={(value, name) => {
              const names = {
                'total': 'Total Current',
                'ion': 'Ion Current',
                'electron': 'Electron Current'
              };
              return [value.toExponential(3) + ' A', names[name] || name];
            }}
            labelFormatter={(value) => `V = ${parseFloat(value).toFixed(1)} V`}
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
          <ReferenceLine 
            x={Vp} 
            stroke="#dc2626" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: `Vp`, 
              position: 'top',
              fill: '#dc2626',
              fontWeight: 'bold',
              fontFamily: 'Times New Roman',
              fontSize: 14
            }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#2563eb" 
            dot={false} 
            name="Total Current" 
            strokeWidth={2.5}
          />
          <Line 
            type="monotone" 
            dataKey="ion" 
            stroke="#dc2626" 
            dot={false} 
            name="Ion Current (CL Model)" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="electron" 
            stroke="#059669" 
            dot={false} 
            name="Electron Current" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Ion current fitted using Chen-Luhmann model; Electron current = Total - Ion</p>
      </div>
    </div>
  );
};

export default IVCurveChart;