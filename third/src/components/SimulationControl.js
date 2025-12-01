import React from 'react';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

/**
 * SimulationControl Component
 * 시뮬레이션 실행 제어 인터페이스
 */
export default function SimulationControl({ 
  isRunning, 
  progress, 
  onStart, 
  onPause, 
  onReset,
  canStart = true,
  errorMessage = null 
}) {

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
      <div className="text-center">
        {/* Status Indicator */}
        {!isRunning && progress === 0 && (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50">
              <Play className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-4">시뮬레이션 준비 완료</h2>
            <p className="text-white/70 mb-8">
              설정을 확인하고 시뮬레이션을 실행하세요
            </p>
          </div>
        )}

        {isRunning && (
          <div>
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 border-8 border-blue-500/30 rounded-full"></div>
              {/* Spinning ring */}
              <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              {/* Progress percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">시뮬레이션 진행 중...</h2>
            <p className="text-white/70 mb-6">
              Monte Carlo 계산을 수행하고 있습니다
            </p>
          </div>
        )}

        {!isRunning && progress > 0 && progress < 100 && (
          <div>
            <div className="bg-yellow-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pause className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-4">시뮬레이션 일시정지</h2>
            <p className="text-white/70 mb-8">
              진행률: {Math.round(progress)}%
            </p>
          </div>
        )}

        {!isRunning && progress === 100 && (
          <div>
            <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">시뮬레이션 완료!</h2>
            <p className="text-white/70 mb-8">
              결과를 확인하거나 새로운 시뮬레이션을 시작하세요
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 text-left">{errorMessage}</p>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-white/60 mt-2">
              {progress < 100 ? `${Math.round(progress)}% 완료` : '완료됨'}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!isRunning && progress < 100 && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-lg ${
                canStart
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/50'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="w-5 h-5" />
              {progress > 0 ? '재개' : '시작'}
            </button>
          )}

          {isRunning && (
            <button
              onClick={onPause}
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg shadow-yellow-500/50"
            >
              <Pause className="w-5 h-5" />
              일시정지
            </button>
          )}

          {progress > 0 && (
            <button
              onClick={onReset}
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all bg-white/10 hover:bg-white/20 border border-white/20"
            >
              <RotateCcw className="w-5 h-5" />
              초기화
            </button>
          )}
        </div>

        {/* Additional Info */}
        {!canStart && !errorMessage && (
          <div className="mt-6 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200 text-left">
              시뮬레이션을 시작하려면 먼저 Cross Section CSV 파일을 업로드해주세요.
            </p>
          </div>
        )}

        {/* Status Details */}
        {isRunning && (
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 mb-1">상태</p>
              <p className="font-medium text-green-400">진행 중</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 mb-1">진행률</p>
              <p className="font-medium">{Math.round(progress)}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 mb-1">예상 시간</p>
              <p className="font-medium">
                {progress > 0 ? `${Math.round((100 - progress) / progress * 2)}초` : '-'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}