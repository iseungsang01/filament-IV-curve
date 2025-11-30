import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceDot } from 'recharts';

const ElectronCurrentChart = ({ voltage, electronCurrent, Vp, Ip }) => {
  const data = voltage
    .map((v, i) => ({
      voltage: v,
      current: electronCurrent[i]
    }))
    .filter(d => d.current > 1e-6);

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Electron Current (Log Scale)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="voltage" 
            type="number"
            label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -10, style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <YAxis 
            scale="log" 
            domain={['auto', 'auto']}
            label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
            tickFormatter={(value) => value.toExponential(0)}
          />
          <Tooltip 
            formatter={(value) => value.toExponential(3)}
            contentStyle={{ fontFamily: 'Times New Roman' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Times New Roman' }} />
          <ReferenceLine x={Vp} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Vp = ${Vp.toFixed(2)} V`, position: 'top', style: { fontFamily: 'Times New Roman', fill: '#ef4444' } }} />
          <Scatter name="Electron Current" data={data} fill="#10b981" />
          <Scatter 
            name={`I_sat = ${Ip.toExponential(2)} A`}
            data={[{ voltage: Vp, current: Ip }]} 
            fill="#ef4444" 
            shape="star"
            legendType="star"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElectronCurrentChart;