import React from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ onFileLoad, dataLoaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        const data = lines.map(line => {
          const parts = line.split(/[\t,\s]+/).filter(p => p.trim());
          const voltage = parseFloat(parts[0]);
          const current = parseFloat(parts[1]);
          return { voltage, current };
        }).filter(d => !isNaN(d.voltage) && !isNaN(d.current));

        if (data.length < 10) {
          alert('Data file must contain at least 10 valid data points');
          return;
        }

        onFileLoad(data);
      } catch (error) {
        alert('Error parsing file: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="text-center py-12">
      <Upload className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
      <h2 className="text-2xl font-bold mb-4">Upload Langmuir Probe Data</h2>
      <p className="text-gray-600 mb-6">
        Upload tab or comma-separated voltage and current data<br/>
        Format: Voltage(V) Current(A)<br/>
        Supported: .dat, .csv, .txt
      </p>
      <label className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
        <input
          type="file"
          accept=".dat,.csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        Choose File
      </label>
      {dataLoaded && (
        <div className="mt-6">
          <p className="text-green-600 font-semibold">
            ✓ Data loaded: {dataLoaded} points
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;