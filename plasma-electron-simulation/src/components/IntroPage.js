// 소개 페이지 컴포넌트
// 현재는 App.js에 통합되어 있으며, 향후 분리할 수 있습니다.

import React from 'react';
import { Play, AlertCircle } from 'lucide-react';

const IntroPage = ({ onStart }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold mb-4">환영합니다! 👋</h1>
        <p className="text-xl text-white/80 mb-6">
          아르곤 플라즈마에서의 전자 충돌 및 이온화 과정을 시뮬레이션하는 웹 애플리케이션입니다.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-500/20 p-6 rounded-lg border border-blue-400/30">
            <h3 className="font-bold text-lg mb-2">🎯 Monte Carlo</h3>
            <p className="text-sm text-white/80">
              확률적 방법으로 전자의 궤적을 추적합니다
            </p>
          </div>
          <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-400/30">
            <h3 className="font-bold text-lg mb-2">⚡ BEB 모델</h3>
            <p className="text-sm text-white/80">
              이론적 단면적 계산을 지원합니다
            </p>
          </div>
          <div className="bg-green-500/20 p-6 rounded-lg border border-green-400/30">
            <h3 className="font-bold text-lg mb-2">📊 실시간 분석</h3>
            <p className="text-sm text-white/80">
              결과를 즉시 시각화하여 제공합니다
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">시작하기 전에</h3>
            <p className="text-white/90">
              시뮬레이션을 시작하려면 <strong>Cross Section CSV 파일</strong>을 업로드해야 합니다.
              파일은 Energy, 1S, 2P, HIGH, IZ 열을 포함해야 합니다.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/50"
      >
        시뮬레이션 시작하기
        <Play className="w-5 h-5" />
      </button>
    </div>
  );
};

export default IntroPage;