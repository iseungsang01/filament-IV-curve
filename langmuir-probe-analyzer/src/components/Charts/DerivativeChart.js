import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const DerivativeChart = ({ voltage, dIdV, Vp }) => {
  const data = voltage.map((v, i) => ({
    voltage: v,
    derivative: dIdV[i]
  }));

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">First Derivative (dI/dV) - Plasma Potential Detection</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="voltage" 
            label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -10, style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <YAxis 
            label={{ value: 'dI/dV (A/V)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <Tooltip 
            formatter={(value) => value.toExponential(3)}
            contentStyle={{ fontFamily: 'Times New Roman' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Times New Roman' }} />
          <ReferenceLine x={Vp} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Vp = ${Vp.toFixed(2)} V`, position: 'top', style: { fontFamily: 'Times New Roman' } }} />
          <Line type="monotone" dataKey="derivative" stroke="#8b5cf6" dot={false} strokeWidth={2} name="dI/dV" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DerivativeChart;