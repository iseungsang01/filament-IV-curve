import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AnalysisMethodology = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            📊
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-indigo-900">분석 방법론 (Analysis Methodology)</h3>
            <p className="text-sm text-gray-600">랭뮤어 프로브 데이터 분석 알고리즘 설명</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6 text-indigo-600" /> : <ChevronDown className="w-6 h-6 text-indigo-600" />}
      </button>

      {isOpen && (
        <div className="px-6 py-4 border-t border-indigo-200 bg-white">
          <div className="space-y-6">
            {/* 1. Ion Current Fitting Model */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-bold text-lg mb-2 text-red-700">1️⃣ 이온 전류 피팅 (Ion Current Fitting)</h4>
              <div className="bg-red-50 p-4 rounded-lg mb-3">
                <p className="font-semibold text-red-900 mb-2">📐 Chen-Luhmann (CL) Model</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-red-200 mb-2">
                  I<sub>ion</sub>(V) = I<sub>sat</sub> × [1 + a × |V<sub>p</sub> - V|<sup>0.75</sup> / T<sub>e</sub><sup>0.75</sup>]
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <strong>I<sub>sat</sub></strong>: 이온 포화 전류 (Ion saturation current)</li>
                  <li>• <strong>a</strong>: CL 계수 (Sheath expansion coefficient, typically 0.3-0.7)</li>
                  <li>• <strong>V<sub>p</sub></strong>: 플라즈마 전위 (Plasma potential)</li>
                  <li>• <strong>T<sub>e</sub></strong>: 전자 온도 (Electron temperature in eV)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-700">
                <strong>적용 영역:</strong> V &lt; -80V (이온 포화 영역)에서 피팅을 수행하여 I<sub>sat</sub>과 a 값을 결정합니다.
                CL 모델은 sheath expansion 효과를 고려한 물리 모델로, 단순 선형 모델보다 정확합니다.
              </p>
            </div>

            {/* 2. Iterative Vp Convergence */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-lg mb-2 text-blue-700">2️⃣ 반복적 V<sub>p</sub> 수렴 (Iterative V<sub>p</sub> Convergence)</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  플라즈마 전위(V<sub>p</sub>)는 전자와 이온 전류의 분리에 영향을 미치므로, 
                  정확한 V<sub>p</sub> 결정을 위해 반복 알고리즘을 사용합니다:
                </p>
                <ol className="text-sm space-y-2 text-gray-700">
                  <li><strong>Step 1:</strong> dI/dV의 최댓값 위치에서 초기 V<sub>p</sub> 추정</li>
                  <li><strong>Step 2:</strong> Log-log 교점법으로 V<sub>p</sub> 보정
                    <ul className="ml-4 mt-1 text-xs">
                      <li>- Retarding region (V<sub>p</sub> - 0.8 ~ V<sub>p</sub> - 0.1): 전자 전류 log-linear fit</li>
                      <li>- Saturation region (V<sub>p</sub> + 0.1 ~ V<sub>p</sub> + 0.8): 포화 전류 log-linear fit</li>
                      <li>- 두 직선의 교점에서 정확한 V<sub>p</sub> 결정</li>
                    </ul>
                  </li>
                  <li><strong>Step 3:</strong> CL 모델로 이온 전류 피팅 (V &lt; -80V)</li>
                  <li><strong>Step 4:</strong> 전체 전압 범위에 대해 이온 전류 계산</li>
                  <li><strong>Step 5:</strong> 전자 전류 = 총 전류 - 이온 전류</li>
                  <li><strong>Step 6:</strong> |V<sub>p,new</sub> - V<sub>p,old</sub>| &lt; 10<sup>-5</sup>까지 반복 (최대 10회)</li>
                </ol>
              </div>
            </div>

            {/* 3. Electron Temperature */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-lg mb-2 text-green-700">3️⃣ 전자 온도 계산 (T<sub>e</sub> Calculation)</h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-mono text-sm bg-white p-3 rounded border border-green-200 mb-2">
                  ln(I<sub>e</sub>) = eV/T<sub>e</sub> + const  →  T<sub>e</sub> = 1 / slope
                </div>
                <p className="text-sm text-gray-700">
                  Retarding region (V &lt; V<sub>p</sub>)에서 전자 전류의 semi-log plot이 선형이라는 이론을 이용합니다.
                  기울기의 역수가 전자 온도(eV 단위)입니다.
                </p>
              </div>
            </div>

            {/* 4. Density Calculation */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold text-lg mb-2 text-purple-700">4️⃣ 밀도 계산 (Density Calculation)</h4>
              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-purple-900 mb-1">이온 밀도 (Ion Density):</p>
                  <div className="font-mono text-sm bg-white p-2 rounded border border-purple-200">
                    n<sub>i</sub> = -I<sub>sat</sub> / (e × c<sub>s</sub> × 0.6 × A)
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    여기서 c<sub>s</sub> = √(T<sub>e</sub>e/m<sub>Ar</sub>)는 Bohm 속도
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-purple-900 mb-1">전자 밀도 (Electron Density):</p>
                  <div className="font-mono text-sm bg-white p-2 rounded border border-purple-200">
                    n<sub>e</sub> = I<sub>p</sub> / (0.25 × e × v<sub>th</sub> × A)
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    여기서 v<sub>th</sub> = √(8eT<sub>e</sub>/πm<sub>e</sub>)는 열속도, I<sub>p</sub>는 V<sub>p</sub>에서의 전자 포화 전류
                  </p>
                </div>
              </div>
            </div>

            {/* 5. EEDF */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-lg mb-2 text-orange-700">5️⃣ EEDF 계산 (Electron Energy Distribution Function)</h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="font-mono text-sm bg-white p-3 rounded border border-orange-200 mb-2">
                  EEDF(ε) ∝ d²I/dV² at ε = V<sub>p</sub> - V
                </div>
                <p className="text-sm text-gray-700">
                  전자 전류의 2차 미분을 통해 전자 에너지 분포 함수를 계산합니다.
                  Druyvesteyn 방법을 사용하며, 0 ~ 20 eV 범위의 에너지 분포를 보여줍니다.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg">
              <h4 className="font-bold text-indigo-900 mb-2">✨ 알고리즘의 장점</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>✓ <strong>물리 기반 모델:</strong> CL 모델은 sheath physics를 정확히 반영</li>
                <li>✓ <strong>반복 수렴:</strong> V<sub>p</sub>와 전류 분리의 상호 의존성을 고려</li>
                <li>✓ <strong>Log-log 교점법:</strong> V<sub>p</sub> 결정의 객관성 확보</li>
                <li>✓ <strong>전체 곡선 활용:</strong> 이온 영역과 전자 영역 모두 사용</li>
              </ul>
            </div>

            {/* References */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p className="font-semibold mb-1">주요 참고문헌:</p>
              <ul className="space-y-1">
                <li>• Chen, F. F. (2001). "Langmuir probe analysis for high density plasmas"</li>
                <li>• Lobbia, R. B., & Gallimore, A. D. (2010). "High-speed dual Langmuir probe"</li>
                <li>• Druyvesteyn, M. J. (1930). "Der Niedervoltbogen"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisMethodology;