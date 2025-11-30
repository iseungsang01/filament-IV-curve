import React from 'react';
import { ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const IVCurveChart = ({ rawData, ionFit, electronFit, Vp }) => {
  const combinedData = rawData.map((d, i) => ({
    voltage: d.voltage,
    total: d.current,
    ion: ionFit[i],
    electron: electronFit[i]
  }));

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Current Separation: Total, Ion, and Electron</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="voltage" 
            label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -10, style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <YAxis 
            label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman' } }}
            style={{ fontFamily: 'Times New Roman' }}
          />
          <Tooltip 
            formatter={(value) => value.toExponential(3)}
            contentStyle={{ fontFamily: 'Times New Roman' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Times New Roman' }} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" dot={false} name="Total Current" strokeWidth={2} />
          <Line type="monotone" dataKey="ion" stroke="#ef4444" dot={false} name="Ion Current Fit" strokeWidth={2} />
          <Line type="monotone" dataKey="electron" stroke="#10b981" dot={false} name="Electron Current" strokeWidth={2} opacity={0.7} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IVCurveChart;