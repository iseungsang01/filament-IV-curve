import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceDot } from 'recharts';

const ElectronCurrentChart = ({ voltage, electronCurrent, Vp, Ip }) => {
  const data = voltage
    .map((v, i) => ({
      voltage: v,
      current: electronCurrent[i]
    }))
    .filter(d => d.current > 1e-9)
    .sort((a, b) => a.voltage - b.voltage);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Electron Current (Semi-log Plot)
      </h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data} margin={{ top: 10, right: 40, left: 80, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="voltage" 
            type="number"
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
            scale="log" 
            domain={['auto', 'auto']}
            label={{ 
              value: 'Electron Current (A)', 
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
            formatter={(value) => [value.toExponential(3) + ' A', 'I_electron']}
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
              value: `Vp = ${Vp.toFixed(1)} V`, 
              position: 'top',
              fill: '#dc2626',
              fontWeight: 'bold',
              fontFamily: 'Times New Roman',
              fontSize: 14
            }}
          />
          <Line 
            type="monotone"
            dataKey="current" 
            stroke="#059669" 
            dot={false}
            strokeWidth={2.5} 
            name="Electron Current"
          />
          <ReferenceDot 
            x={Vp} 
            y={Ip} 
            r={6} 
            fill="#dc2626" 
            stroke="#fff"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Retarding region (V &lt; V<sub>p</sub>) slope yields electron temperature</p>
      </div>
    </div>
  );
};

export default ElectronCurrentChart;