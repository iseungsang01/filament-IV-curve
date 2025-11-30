import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const RawDataView = ({ data }) => {
  // 데이터를 voltage 순으로 정렬
  const sortedData = [...data].sort((a, b) => a.voltage - b.voltage);
  
  // 통계 정보 계산
  const voltages = data.map(d => d.voltage);
  const currents = data.map(d => d.current);
  const minV = Math.min(...voltages);
  const maxV = Math.max(...voltages);
  const minI = Math.min(...currents);
  const maxI = Math.max(...currents);
  
  // 0V 근처 찾기
  const zeroIndex = sortedData.findIndex(d => d.voltage >= 0);
  const nearZeroData = zeroIndex >= 0 ? sortedData[zeroIndex] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-indigo-900 mb-2">Raw I-V Characteristic</h2>
        <p className="text-gray-600">원본 Langmuir Probe 전류-전압 특성 곡선</p>
      </div>

      {/* 데이터 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow">
          <p className="text-sm text-blue-700 font-semibold mb-1">📊 Data Points</p>
          <p className="text-3xl font-bold text-blue-900">{data.length}</p>
          <p className="text-xs text-blue-600 mt-1">측정된 전압-전류 쌍</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow">
          <p className="text-sm text-green-700 font-semibold mb-1">⚡ Voltage Range</p>
          <p className="text-2xl font-bold text-green-900">
            {minV.toFixed(2)} ~ {maxV.toFixed(2)} V
          </p>
          <p className="text-xs text-green-600 mt-1">Sweep range: {(maxV - minV).toFixed(2)} V</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow">
          <p className="text-sm text-purple-700 font-semibold mb-1">🔌 Current Range</p>
          <p className="text-xl font-bold text-purple-900">
            {minI.toExponential(2)} ~ {maxI.toExponential(2)} A
          </p>
          <p className="text-xs text-purple-600 mt-1">Dynamic range: {(maxI/minI).toExponential(1)}×</p>
        </div>
      </div>

      {/* I-V 곡선 영역 설명 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500">
        <h3 className="font-bold text-amber-900 mb-2">💡 Langmuir Probe I-V 곡선 영역 해석</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="font-semibold text-red-700 mb-1">🔴 Ion Saturation (V &lt;&lt; 0)</p>
            <p className="text-gray-700 text-xs">전자가 반발되고 이온만 수집되는 영역. 전류가 거의 일정 (포화).</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="font-semibold text-blue-700 mb-1">🔵 Transition (V ≈ 0)</p>
            <p className="text-gray-700 text-xs">전자 전류가 급격히 증가하는 영역. 기울기에서 전자 온도 측정 가능.</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="font-semibold text-green-700 mb-1">🟢 Electron Saturation (V &gt;&gt; 0)</p>
            <p className="text-gray-700 text-xs">대부분의 전자를 수집. V<sub>p</sub>(plasma potential) 근처에서 포화.</p>
          </div>
        </div>
      </div>
      
      {/* 메인 차트 */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <ResponsiveContainer width="100%" height={500}>
          <LineChart 
            data={sortedData} 
            margin={{ top: 20, right: 40, left: 80, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            
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
                  fontSize: 18, 
                  fontWeight: 'bold',
                  fill: '#1e40af'
                } 
              }}
              style={{ fontFamily: 'Times New Roman', fontSize: 14 }}
              tickFormatter={(value) => value.toFixed(0)}
              stroke="#1e40af"
              strokeWidth={2}
            />
            
            <YAxis 
              label={{ 
                value: 'Probe Current (A)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: 20,
                style: { 
                  fontFamily: 'Times New Roman', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  fill: '#7c3aed'
                } 
              }}
              style={{ fontFamily: 'Times New Roman', fontSize: 14 }}
              tickFormatter={(value) => value.toExponential(1)}
              stroke="#7c3aed"
              strokeWidth={2}
            />
            
            <Tooltip 
              formatter={(value) => [`${value.toExponential(3)} A`, 'Current']}
              labelFormatter={(value) => `Voltage = ${value.toFixed(2)} V`}
              contentStyle={{ 
                fontFamily: 'Times New Roman',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '3px solid #3b82f6',
                borderRadius: '10px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              labelStyle={{
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '5px'
              }}
            />
            
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'Times New Roman', 
                fontSize: 15,
                paddingTop: '20px'
              }} 
              iconType="line"
            />
            
            {/* 0V 기준선 */}
            <ReferenceLine 
              x={0} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ 
                value: 'V = 0', 
                position: 'top',
                fill: '#ef4444',
                fontWeight: 'bold',
                fontFamily: 'Times New Roman'
              }}
            />
            
            <ReferenceLine 
              y={0} 
              stroke="#6b7280" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              name="Measured Current (I)" 
              activeDot={{ r: 6, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 데이터 품질 체크 */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">✓ Data Quality Check</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Data points:</p>
            <p className={`font-bold ${data.length >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
              {data.length} {data.length >= 50 ? '✓ Good' : '⚠ Low'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Voltage coverage:</p>
            <p className={`font-bold ${(maxV - minV) > 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {(maxV - minV).toFixed(1)} V {(maxV - minV) > 100 ? '✓ Wide' : '⚠ Narrow'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Negative V region:</p>
            <p className={`font-bold ${minV < -80 ? 'text-green-600' : 'text-orange-600'}`}>
              {minV < -80 ? '✓ Adequate' : '⚠ Limited'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Positive V region:</p>
            <p className={`font-bold ${maxV > 20 ? 'text-green-600' : 'text-orange-600'}`}>
              {maxV > 20 ? '✓ Adequate' : '⚠ Limited'}
            </p>
          </div>
        </div>
      </div>

      {/* 분석 준비 안내 */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-lg border-2 border-indigo-300">
        <h3 className="font-bold text-indigo-900 text-lg mb-2">🚀 Ready for Analysis</h3>
        <p className="text-gray-700 text-sm mb-3">
          이 데이터는 다음 단계의 분석을 위해 준비되었습니다:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>✓ 플라즈마 전위(V<sub>p</sub>) 결정 (dI/dV 최댓값 및 Log-log 교점법)</li>
          <li>✓ 전자 온도(T<sub>e</sub>) 측정 (Retarding region의 ln(I) vs V 기울기)</li>
          <li>✓ 이온 전류 분리 (Chen-Luhmann 모델 피팅, V &lt; -80V)</li>
          <li>✓ 전자/이온 밀도 계산</li>
          <li>✓ EEDF 추출 (d²I/dV²)</li>
        </ul>
        <p className="text-indigo-700 font-semibold mt-3 text-sm">
          → 아래 "Run Full Analysis" 버튼을 눌러 분석을 시작하세요!
        </p>
      </div>
    </div>
  );
};

export default RawDataView;