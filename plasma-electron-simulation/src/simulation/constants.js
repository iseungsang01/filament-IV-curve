// 물리 상수
export const PHYSICAL_CONSTANTS = {
  // 전자 질량 (kg)
  ELECTRON_MASS: 9.10938356e-31,
  
  // 기본 전하량 (C)
  ELEMENTARY_CHARGE: 1.602176634e-19,
  
  // 아르곤 원자 질량 (kg)
  ARGON_MASS: 6.633521356e-26,
  
  // 볼츠만 상수 (J/K)
  BOLTZMANN: 1.380649e-23,
  
  // 플랑크 상수 (J·s)
  PLANCK: 6.62607015e-34,
  
  // 진공 유전율 (F/m)
  EPSILON_0: 8.8541878128e-12,
  
  // 보어 반지름 (m)
  BOHR_RADIUS: 5.29177210903e-11
};

// 아르곤 원자 데이터
export const ARGON_DATA = {
  // 이온화 에너지 (eV)
  IONIZATION_ENERGY: 15.76,
  
  // 여기 에너지 준위 (eV)
  EXCITATION_1S: 11.55,
  EXCITATION_2P: 11.72,
  EXCITATION_HIGH: 13.0,
  
  // 원자 번호
  ATOMIC_NUMBER: 18,
  
  // 원자 반지름 (m)
  ATOMIC_RADIUS: 1.88e-10
};

// 시뮬레이션 설정
export const SIMULATION_CONFIG = {
  // 기본 시간 간격 (s)
  DEFAULT_TIME_STEP: 1e-12,
  
  // 최대 충돌 횟수
  DEFAULT_MAX_COLLISIONS: 100,
  
  // 에너지 임계값 (eV)
  MIN_ENERGY_THRESHOLD: 0.1,
  
  // 벽 흡수 확률
  WALL_ABSORPTION_PROBABILITY: 0.9
};

// 충돌 타입
export const COLLISION_TYPES = {
  ELASTIC: 'elastic',
  EXCITATION_1S: 'excitation_1s',
  EXCITATION_2P: 'excitation_2p',
  EXCITATION_HIGH: 'excitation_high',
  IONIZATION: 'ionization'
};

// eV를 J로 변환
export const eVtoJ = (eV) => eV * PHYSICAL_CONSTANTS.ELEMENTARY_CHARGE;

// J를 eV로 변환
export const JtoeV = (J) => J / PHYSICAL_CONSTANTS.ELEMENTARY_CHARGE;

// 전자 속도 계산 (에너지로부터)
export const velocityFromEnergy = (energyEV) => {
  const energyJ = eVtoJ(energyEV);
  return Math.sqrt(2 * energyJ / PHYSICAL_CONSTANTS.ELECTRON_MASS);
};

// 에너지 계산 (속도로부터)
export const energyFromVelocity = (velocity) => {
  const energyJ = 0.5 * PHYSICAL_CONSTANTS.ELECTRON_MASS * velocity * velocity;
  return JtoeV(energyJ);
};