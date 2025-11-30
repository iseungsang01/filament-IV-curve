import React from 'react';

const ResultsCard = ({ title, value, unit, error }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
      <p className="text-2xl font-bold text-indigo-900">
        {typeof value === 'number' && Math.abs(value) < 0.01 
          ? value.toExponential(4) 
          : typeof value === 'number'
          ? value.toFixed(4)
          : value}
      </p>
      <p className="text-xs text-indigo-700 mt-1">
        {unit}
        {error && ` ± ${typeof error === 'number' && Math.abs(error) < 0.01 ? error.toExponential(2) : error.toFixed(4)}`}
      </p>
    </div>
  );
};

export default ResultsCard;