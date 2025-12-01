/**
 * Physical Constants and Simulation Parameters
 * 플라즈마 전자 시뮬레이션에 필요한 물리 상수들
 */

// 기본 물리 상수
export const CONSTANTS = {
  // 전자 질량 (kg)
  ELECTRON_MASS: 9.10938e-31,
  
  // 전자 전하량 (C)
  ELECTRON_CHARGE: 1.60218e-19,
  
  // 볼츠만 상수 (J/K)
  BOLTZMANN: 1.38065e-23,
  
  // 아르곤 원자 질량 (kg)
  ARGON_MASS: 6.63e-26,
  
  // eV를 Joule로 변환
  EV_TO_JOULE: 1.60218e-19,
  
  // Joule을 eV로 변환
  JOULE_TO_EV: 6.24151e18,
  
  // 진공 유전율 (F/m)
  EPSILON_0: 8.85419e-12,
  
  // 플랑크 상수 (J·s)
  PLANCK: 6.62607e-34,
  
  // 광속 (m/s)
  SPEED_OF_LIGHT: 2.99792e8
};

// 아르곤 원자 특성
export const ARGON_PROPERTIES = {
  // 이온화 에너지 (eV)
  IONIZATION_ENERGY: 15.76,
  
  // 여기 에너지 준위 (eV)
  EXCITATION_LEVELS: {
    '1S5': 11.55,
    '1S4': 11.62,
    '1S3': 11.72,
    '1S2': 11.83,
    '2P10': 12.91,
    '2P9': 13.08,
    '2P8': 13.10,
    '2P7': 13.15,
    '2P6': 13.17,
    '2P5': 13.27,
    '2P4': 13.28,
    '2P3': 13.30,
    '2P2': 13.33,
    '2P1': 13.48
  },
  
  // 메타스테이블 상태 에너지 (eV)
  METASTABLE_LEVELS: {
    '1S5': 11.55,
    '1S3': 11.72
  },
  
  // 원자 반지름 (m)
  ATOMIC_RADIUS: 0.71e-10,
  
  // 표준 상태 밀도 (m^-3, 0°C, 1 atm)
  STANDARD_DENSITY: 2.69e25,
  
  // 상온 대기압 밀도 (m^-3, 25°C, 1 atm)
  ROOM_TEMP_DENSITY: 3.22e22
};

// 시뮬레이션 기본 설정
export const SIMULATION_DEFAULTS = {
  // 초기 전자 에너지 (eV)
  INITIAL_ENERGY: 90,
  
  // 가스 밀도 (m^-3)
  GAS_DENSITY: 3.22e22,
  
  // 플라즈마 전위 (V)
  PLASMA_VOLTAGE: 15.0,
  
  // 시뮬레이션 전자 개수
  NUM_ELECTRONS: 10000,
  
  // 챔버 부피 (m^3)
  CHAMBER_VOLUME: 0.001,
  
  // 벽면 면적 (m^2)
  WALL_AREA: 0.1,
  
  // 최대 충돌 횟수
  MAX_COLLISIONS: 1000,
  
  // 시간 간격 (s)
  TIME_STEP: 1e-12,
  
  // 최소 에너지 (eV) - 이 이하로 떨어지면 전자 흡수
  MIN_ENERGY: 0.1
};

// 충돌 유형
export const COLLISION_TYPES = {
  ELASTIC: 'elastic',           // 탄성 충돌
  EXCITATION_1S: 'excitation_1s',  // 1S 여기
  EXCITATION_2P: 'excitation_2p',  // 2P 여기
  EXCITATION_HIGH: 'excitation_high', // 고준위 여기
  IONIZATION: 'ionization'      // 이온화
};

// BEB 모델 파라미터 (아르곤)
export const BEB_PARAMETERS = {
  // 3p^6 껍질 (가장 바깥쪽 전자)
  '3p': {
    N: 6,           // 전자 개수
    B: 15.76,       // 결합 에너지 (eV)
    U: 13.48,       // 평균 운동 에너지 (eV)
    Q: 1.0          // 스크리닝 파라미터
  },
  
  // 3s^2 껍질
  '3s': {
    N: 2,
    B: 29.24,
    U: 24.1,
    Q: 0.8
  }
};

// 수치 계산 파라미터
export const NUMERICAL_PARAMS = {
  // 보간 방법
  INTERPOLATION_METHOD: 'linear',
  
  // 난수 시드 (재현성을 위해)
  RANDOM_SEED: null,
  
  // 진행률 업데이트 간격
  PROGRESS_UPDATE_INTERVAL: 100,
  
  // 에너지 빈 개수 (히스토그램용)
  ENERGY_BINS: 50,
  
  // 각도 빈 개수
  ANGLE_BINS: 36
};

// 단위 변환 함수들
export const convertEnergy = {
  // eV -> Joule
  eVToJoule: (eV) => eV * CONSTANTS.EV_TO_JOULE,
  
  // Joule -> eV
  jouleToEV: (joule) => joule * CONSTANTS.JOULE_TO_EV,
  
  // eV -> 속도 (m/s)
  eVToVelocity: (eV) => {
    const joule = eV * CONSTANTS.EV_TO_JOULE;
    return Math.sqrt(2 * joule / CONSTANTS.ELECTRON_MASS);
  },
  
  // 속도 -> eV
  velocityToEV: (velocity) => {
    const joule = 0.5 * CONSTANTS.ELECTRON_MASS * velocity * velocity;
    return joule * CONSTANTS.JOULE_TO_EV;
  }
};

// 온도와 밀도 관계
export const gasDensity = {
  // 이상기체 방정식: n = P / (k_B * T)
  // P: 압력 (Pa), T: 온도 (K), n: 밀도 (m^-3)
  
  fromPressureTemp: (pressure, temperature) => {
    return pressure / (CONSTANTS.BOLTZMANN * temperature);
  },
  
  // 표준 상태 (0°C, 1 atm)
  standard: () => {
    return gasDensity.fromPressureTemp(101325, 273.15);
  },
  
  // 상온 (25°C, 1 atm)
  roomTemp: () => {
    return gasDensity.fromPressureTemp(101325, 298.15);
  }
};

// Cross Section 데이터 범위
export const CROSS_SECTION_RANGE = {
  MIN_ENERGY: 0.01,   // eV
  MAX_ENERGY: 1000,   // eV
  NUM_POINTS: 1000    // 데이터 포인트 개수
};

// 시뮬레이션 경고 임계값
export const WARNING_THRESHOLDS = {
  // 높은 전자 개수 경고
  HIGH_ELECTRON_COUNT: 50000,
  
  // 낮은 에너지 경고
  LOW_ENERGY_WARNING: 1,  // eV
  
  // 높은 에너지 경고
  HIGH_ENERGY_WARNING: 500,  // eV
  
  // 낮은 가스 밀도 경고
  LOW_DENSITY_WARNING: 1e20,  // m^-3
  
  // 높은 가스 밀도 경고
  HIGH_DENSITY_WARNING: 1e24  // m^-3
};

export default {
  CONSTANTS,
  ARGON_PROPERTIES,
  SIMULATION_DEFAULTS,
  COLLISION_TYPES,
  BEB_PARAMETERS,
  NUMERICAL_PARAMS,
  convertEnergy,
  gasDensity,
  CROSS_SECTION_RANGE,
  WARNING_THRESHOLDS
};