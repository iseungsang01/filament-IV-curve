import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const IVCurveChart = ({ rawData, ionFit, electronFit, Vp }) => {
  const combinedData = rawData.map((d, i) => ({
    voltage: d.voltage,
    total: d.current,
    ion: ionFit[i],
    electron: electronFit[i]
  })).sort((a, b) => a.voltage - b.voltage);

  // X축 범위 계산
  const voltages = combinedData.map(d => d.voltage);
  const minV = Math.min(...voltages);
  const maxV = Math.max(...voltages);
  
  // Y축 범위 계산 (모든 데이터 포함)
  const allCurrents = combinedData.flatMap(d => [d.total, d.ion, d.electron]);
  const minI = Math.min(...allCurrents);
  const maxI = Math.max(...allCurrents);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Current Separation: Total, Ion, and Electron Components
      </h3>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={combinedData} margin={{ top: 20, right: 50, left: 90, bottom: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          
          <XAxis 
            dataKey="voltage"
            type="number"
            domain={[Math.floor(minV / 10) * 10, Math.ceil(maxV / 10) * 10]}
            ticks={Array.from(
              { length: Math.floor((maxV - minV) / 20) + 1 }, 
              (_, i) => Math.ceil(minV / 20) * 20 + i * 20
            )}
            label={{ 
              value: 'Probe Voltage (V)', 
              position: 'insideBottom', 
              offset: -25, 
              style: { 
                fontFamily: 'Times New Roman', 
                fontSize: 18, 
                fontWeight: 'bold',
                fill: '#000'
              } 
            }}
            style={{ fontFamily: 'Times New Roman', fontSize: 15 }}
            tick={{ fill: '#000' }}
            stroke="#000"
            strokeWidth={1.5}
          />
          
          <YAxis 
            domain={[minI * 1.1, maxI * 1.1]}
            label={{ 
              value: 'Current (A)', 
              angle: -90, 
              position: 'insideLeft', 
              offset: 25,
              style: { 
                fontFamily: 'Times New Roman', 
                fontSize: 18, 
                fontWeight: 'bold',
                fill: '#000'
              } 
            }}
            style={{ fontFamily: 'Times New Roman', fontSize: 15 }}
            tick={{ fill: '#000' }}
            tickFormatter={(value) => {
              if (Math.abs(value) < 0.001) {
                return value.toExponential(1);
              }
              return value.toFixed(4);
            }}
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
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '2px solid #000',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '14px'
            }}
          />
          
          <Legend 
            wrapperStyle={{ 
              fontFamily: 'Times New Roman', 
              fontSize: 15,
              paddingTop: '15px'
            }}
            iconType="line"
            iconSize={20}
          />
          
          <ReferenceLine 
            x={Vp} 
            stroke="#dc2626" 
            strokeDasharray="6 4" 
            strokeWidth={2.5}
            label={{ 
              value: `Vp = ${Vp.toFixed(1)} V`, 
              position: 'top',
              fill: '#dc2626',
              fontWeight: 'bold',
              fontFamily: 'Times New Roman',
              fontSize: 15,
              offset: 10
            }}
          />
          
          <ReferenceLine 
            y={0} 
            stroke="#666" 
            strokeWidth={1}
          />
          
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#2563eb" 
            dot={false} 
            name="Total Current" 
            strokeWidth={3}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="ion" 
            stroke="#dc2626" 
            dot={false} 
            name="Ion Current (CL Model)" 
            strokeWidth={2.5}
            strokeDasharray="8 4"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="electron" 
            stroke="#059669" 
            dot={false} 
            name="Electron Current" 
            strokeWidth={2.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
        <p><strong>Ion current</strong> fitted using Chen-Luhmann model</p>
        <p><strong>Electron current</strong> = Total current - Ion current</p>
      </div>
    </div>
  );
};

export default IVCurveChart;