import React from 'react';
import { Play, Atom, Zap, Target, BookOpen, Github, Mail, AlertCircle } from 'lucide-react';

/**
 * IntroPage Component
 * 애플리케이션 소개 페이지
 */
export default function IntroPage({ onStart }) {
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl">
            <Atom className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Plasma Electron Simulation</h1>
            <p className="text-xl text-white/80">
              아르곤 플라즈마 전자 충돌 Monte Carlo 시뮬레이션
            </p>
          </div>
        </div>
        
        <p className="text-white/90 leading-relaxed">
          이 웹 애플리케이션은 저온 플라즈마에서 전자의 충돌 과정을 Monte Carlo 방법으로 시뮬레이션합니다. 
          실험 단면적 데이터(Biagi database)를 사용하여 전자-원자 충돌, 여기, 이온화 과정을 추적하고 
          통계적으로 분석합니다.
        </p>
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Target className="w-8 h-8" />}
          title="Monte Carlo 방법"
          description="확률적 접근으로 개별 전자의 궤적을 추적하고 충돌 과정을 시뮬레이션합니다."
          color="blue"
        />
        
        <FeatureCard
          icon={<Zap className="w-8 h-8" />}
          title="다중 충돌 유형"
          description="탄성 충돌, 1S/2P 여기, 고준위 여기, 이온화 등 모든 충돌 과정을 포함합니다."
          color="purple"
        />
        
        <FeatureCard
          icon={<BookOpen className="w-8 h-8" />}
          title="실시간 분석"
          description="이온화 분포, 에너지 손실, 충돌 빈도 등을 실시간으로 시각화하고 분석합니다."
          color="green"
        />
      </div>
      
      {/* How It Works */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          작동 원리
        </h2>
        
        <div className="space-y-4">
          <Step
            number={1}
            title="초기화"
            description="초기 에너지를 가진 전자가 아르곤 가스 플라즈마에 주입됩니다."
          />
          
          <Step
            number={2}
            title="자유 행로 계산"
            description="단면적과 가스 밀도를 이용해 다음 충돌까지의 거리를 확률적으로 결정합니다."
          />
          
          <Step
            number={3}
            title="충돌 유형 결정"
            description="각 충돌 유형의 단면적 비율에 따라 충돌 종류를 무작위로 선택합니다."
          />
          
          <Step
            number={4}
            title="에너지 업데이트"
            description="충돌 결과에 따라 전자의 에너지가 감소하고, 이온화 시 이차 전자가 생성됩니다."
          />
          
          <Step
            number={5}
            title="반복 및 통계"
            description="전자가 흡수되거나 에너지를 잃을 때까지 반복하고, 모든 전자에 대해 통계를 수집합니다."
          />
        </div>
      </div>
      
      {/* Physical Background */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4">주요 물리 파라미터</h3>
          
          <div className="space-y-3 text-sm">
            <ParamRow label="아르곤 이온화 에너지" value="15.76 eV" />
            <ParamRow label="1S 여기 에너지" value="11.55 eV" />
            <ParamRow label="2P 여기 에너지" value="12.91 eV" />
            <ParamRow label="표준 가스 밀도" value="3.22×10²² m⁻³" />
            <ParamRow label="전자 질량" value="9.109×10⁻³¹ kg" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4">시뮬레이션 가정</h3>
          
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>저온 플라즈마 (전자 온도 {'>'} 이온 온도)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>희박 플라즈마 (전자-전자 충돌 무시)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>균일한 가스 밀도 분포</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>정상 상태 (시간에 무관)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>자기장 무시 (E×B 드리프트 없음)</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Important Note */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">시작하기 전에</h3>
            <p className="text-white/90 mb-3">
              시뮬레이션을 실행하려면 <strong>Cross Section CSV 파일</strong>을 먼저 업로드해야 합니다.
            </p>
            <p className="text-white/80 text-sm">
              파일 형식: Energy, 1S, 2P, HIGH, IZ 열을 포함하는 CSV 파일<br/>
              예: Biagi database의 아르곤 전자 충돌 단면적 데이터
            </p>
          </div>
        </div>
      </div>
      
      {/* References */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">참고 문헌 및 데이터</h3>
        
        <div className="space-y-3 text-sm">
          <Reference
            title="LXCat Database"
            description="전자-원자 충돌 단면적 데이터베이스"
            url="https://nl.lxcat.net"
          />
          
          <Reference
            title="Biagi Database"
            description="저에너지 전자 전송 특성 및 단면적"
            url="https://fr.lxcat.net/Biagi"
          />
          
          <Reference
            title="Phelps Database"
            description="아르곤 전자 충돌 단면적"
            url="https://fr.lxcat.net/Phelps"
          />
        </div>
      </div>
      
      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/50"
      >
        <Play className="w-6 h-6" />
        시뮬레이션 시작하기
      </button>
    </div>
  );
}

/**
 * Feature Card Component
 */
function FeatureCard({ icon, title, description, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-400/30',
    purple: 'bg-purple-500/20 border-purple-400/30',
    green: 'bg-green-500/20 border-green-400/30'
  };
  
  return (
    <div className={`${colorClasses[color]} backdrop-blur-md rounded-xl p-6 border`}>
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </div>
  );
}

/**
 * Step Component
 */
function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-bold mb-1">{title}</h4>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </div>
  );
}

/**
 * Parameter Row Component
 */
function ParamRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <span className="text-white/70">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

/**
 * Reference Component
 */
function Reference({ title, description, url }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
      >
        {title} →
      </a>
      <p className="text-white/70 text-xs mt-1">{description}</p>
    </div>
  );
}