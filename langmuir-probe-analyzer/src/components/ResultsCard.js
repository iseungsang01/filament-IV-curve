import React from 'react';

const ResultsCard = ({ title, value, unit, error }) => {
  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    
    // 과학적 표기법이 필요한 경우 (절댓값이 0.01보다 작거나 10000보다 큰 경우)
    if (Math.abs(val) < 0.01 || Math.abs(val) > 10000) {
      return val.toExponential(2); // 소수점 둘째자리
    }
    
    // 일반 숫자는 소수점 둘째자리까지
    return val.toFixed(2);
  };

  // 값의 크기에 따라 색상 및 아이콘 결정
  const getCardStyle = () => {
    if (title.includes('Potential')) {
      return {
        gradient: 'from-blue-50 to-blue-100',
        icon: '⚡',
        iconBg: 'bg-blue-500',
        textColor: 'text-blue-900',
        unitColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      };
    } else if (title.includes('Temperature')) {
      return {
        gradient: 'from-orange-50 to-orange-100',
        icon: '🌡️',
        iconBg: 'bg-orange-500',
        textColor: 'text-orange-900',
        unitColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      };
    } else if (title.includes('Ion')) {
      return {
        gradient: 'from-red-50 to-red-100',
        icon: '🔴',
        iconBg: 'bg-red-500',
        textColor: 'text-red-900',
        unitColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    } else if (title.includes('Electron')) {
      return {
        gradient: 'from-green-50 to-green-100',
        icon: '⚛️',
        iconBg: 'bg-green-500',
        textColor: 'text-green-900',
        unitColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        gradient: 'from-indigo-50 to-indigo-100',
        icon: '📊',
        iconBg: 'bg-indigo-500',
        textColor: 'text-indigo-900',
        unitColor: 'text-indigo-700',
        borderColor: 'border-indigo-200'
      };
    }
  };

  const style = getCardStyle();

  return (
    <div className={`bg-gradient-to-br ${style.gradient} p-5 rounded-xl shadow-lg border-2 ${style.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      {/* 헤더 섹션 */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${style.iconBg} w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-md`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-semibold leading-tight">
            {title}
          </p>
        </div>
      </div>

      {/* 값 섹션 */}
      <div className="mb-2">
        <p className={`text-3xl font-bold ${style.textColor} leading-tight font-mono`}>
          {formatValue(value)}
        </p>
      </div>

      {/* 단위 섹션 */}
      <div className="flex items-center justify-between">
        <p className={`text-sm ${style.unitColor} font-semibold`}>
          {unit}
        </p>
        {error && (
          <p className="text-xs text-gray-500 font-mono">
            ± {formatValue(error)}
          </p>
        )}
      </div>

      {/* 물리적 의미 설명 (선택적) */}
      {title.includes('Potential') && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            💡 Plasma potential: 플라즈마의 전위
          </p>
        </div>
      )}
      {title.includes('Temperature') && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <p className="text-xs text-gray-600">
            💡 Electron energy: 전자의 평균 에너지
          </p>
        </div>
      )}
      {title.includes('Ion Density') && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-gray-600">
            💡 Ion concentration: 이온 농도
          </p>
        </div>
      )}
      {title.includes('Electron Density') && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-600">
            💡 Electron concentration: 전자 농도
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsCard;