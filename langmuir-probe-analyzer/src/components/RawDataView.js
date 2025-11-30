import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RawDataView = ({ data }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Raw I-V Characteristic</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Total data points: {data.length}<br/>
          Voltage range: {Math.min(...data.map(d => d.voltage)).toFixed(2)} V to {Math.max(...data.map(d => d.voltage)).toFixed(2)} V<br/>
          Current range: {Math.min(...data.map(d => d.current)).toExponential(2)} A to {Math.max(...data.map(d => d.current)).toExponential(2)} A
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="voltage" 
            type="number" 
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
          <Scatter name="Raw Data" data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RawDataView;