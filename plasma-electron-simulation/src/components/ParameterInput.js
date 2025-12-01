import React from 'react';
import { Settings, Info } from 'lucide-react';

/**
 * ParameterInput Component
 * 시뮬레이션 파라미터 입력 인터페이스
 */
export default function ParameterInput({ params, onParamsChange }) {
  
  const handleChange = (key, value) => {
    onParamsChange({
      ...params,
      [key]: value
    });
  };

  const parameterConfigs = [
    {
      key: 'initialEnergy',
      label: '초기 전자 에너지',
      unit: 'eV',
      type: 'number',
      min: 1,
      max: 1000,
      step: 1,
      description: '전자의 초기 운동 에너지 (일반적으로 50-100 eV)'
    },
    {
      key: 'gasDensity',
      label: '가스 밀도',
      unit: 'm⁻³',
      type: 'number',
      min: 1e20,
      max: 1e24,
      step: 1e20,
      description: '아르곤 가스의 수밀도 (상온 대기압: ~3.22×10²² m⁻³)'
    },
    {
      key: 'plasmaVoltage',
      label: '플라즈마 전위',
      unit: 'V',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      description: '플라즈마 공간 전위 (일반적으로 10-20 V)'
    },
    {
      key: 'numElectrons',
      label: '시뮬레이션 전자 수',
      unit: '개',
      type: 'number',
      min: 100,
      max: 100000,
      step: 100,
      description: 'Monte Carlo 시뮬레이션할 전자 개수'
    },
    {
      key: 'chamberVolume',
      label: '챔버 부피',
      unit: 'm³',
      type: 'number',
      min: 0.0001,
      max: 1,
      step: 0.0001,
      description: '플라즈마 챔버의 부피'
    },
    {
      key: 'wallArea',
      label: '벽면 면적',
      unit: 'm²',
      type: 'number',
      min: 0.01,
      max: 10,
      step: 0.01,
      description: '챔버 벽면의 총 면적'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        시뮬레이션 파라미터
      </h2>

      <div className="space-y-6">
        {parameterConfigs.map(config => (
          <div key={config.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                {config.label}
                <span className="text-white/60 text-xs">({config.unit})</span>
              </label>
              <div className="group relative">
                <Info className="w-4 h-4 text-white/40 hover:text-white/70 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-black/90 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {config.description}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <input
                type={config.type}
                value={params[config.key]}
                onChange={(e) => handleChange(config.key, parseFloat(e.target.value) || 0)}
                min={config.min}
                max={config.max}
                step={config.step}
                className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
              
              {/* Range Slider for better UX */}
              <input
                type="range"
                value={params[config.key]}
                onChange={(e) => handleChange(config.key, parseFloat(e.target.value))}
                min={config.min}
                max={config.max}
                step={config.step}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    ((params[config.key] - config.min) / (config.max - config.min)) * 100
                  }%, rgba(255,255,255,0.2) ${
                    ((params[config.key] - config.min) / (config.max - config.min)) * 100
                  }%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Display scientific notation for very large/small numbers */}
            {(params[config.key] > 1e6 || params[config.key] < 0.001) && (
              <p className="text-xs text-white/60">
                = {params[config.key].toExponential(2)} {config.unit}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Preset Configurations */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <p className="text-sm font-medium mb-3">빠른 설정</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onParamsChange({
              initialEnergy: 90,
              gasDensity: 3.22e22,
              plasmaVoltage: 15.0,
              numElectrons: 10000,
              chamberVolume: 0.001,
              wallArea: 0.1
            })}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm transition-all border border-blue-400/30"
          >
            기본 설정
          </button>
          <button
            onClick={() => onParamsChange({
              initialEnergy: 50,
              gasDensity: 1e22,
              plasmaVoltage: 10.0,
              numElectrons: 5000,
              chamberVolume: 0.001,
              wallArea: 0.1
            })}
            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm transition-all border border-green-400/30"
          >
            저에너지
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}