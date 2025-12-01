/**
 * Collision Frequency Calculations
 * 충돌 빈도 및 관련 플라즈마 파라미터 계산
 */

import { CONSTANTS, ARGON_PROPERTIES } from './constants';

/**
 * 전자-중성 입자 충돌 빈도 계산
 * ν_en = n_g × σ × v_e
 * @param {number} energy - 전자 에너지 (eV)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {number} crossSection - 충돌 단면적 (m^2)
 * @returns {number} 충돌 빈도 (Hz)
 */
export function calculateCollisionFrequency(energy, gasDensity, crossSection) {
  const velocity = getElectronVelocity(energy);
  return gasDensity * crossSection * velocity;
}

/**
 * 전자 속도 계산
 * v = √(2E/m_e)
 * @param {number} energy - 에너지 (eV)
 * @returns {number} 속도 (m/s)
 */
export function getElectronVelocity(energy) {
  const energyJoule = energy * CONSTANTS.EV_TO_JOULE;
  return Math.sqrt(2 * energyJoule / CONSTANTS.ELECTRON_MASS);
}

/**
 * 평균 자유 행로 계산
 * λ = 1 / (n × σ)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {number} crossSection - 충돌 단면적 (m^2)
 * @returns {number} 평균 자유 행로 (m)
 */
export function calculateMeanFreePath(gasDensity, crossSection) {
  if (gasDensity === 0 || crossSection === 0) return Infinity;
  return 1 / (gasDensity * crossSection);
}

/**
 * 평균 충돌 시간 계산
 * τ = λ / v
 * @param {number} energy - 전자 에너지 (eV)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {number} crossSection - 충돌 단면적 (m^2)
 * @returns {number} 평균 충돌 시간 (s)
 */
export function calculateMeanCollisionTime(energy, gasDensity, crossSection) {
  const mfp = calculateMeanFreePath(gasDensity, crossSection);
  const velocity = getElectronVelocity(energy);
  return mfp / velocity;
}

/**
 * 플라즈마 주파수 계산
 * ω_pe = √(n_e × e² / (ε_0 × m_e))
 * @param {number} electronDensity - 전자 밀도 (m^-3)
 * @returns {number} 플라즈마 주파수 (rad/s)
 */
export function calculatePlasmaFrequency(electronDensity) {
  const omega_pe_squared = (electronDensity * CONSTANTS.ELECTRON_CHARGE * CONSTANTS.ELECTRON_CHARGE) /
                           (CONSTANTS.EPSILON_0 * CONSTANTS.ELECTRON_MASS);
  return Math.sqrt(omega_pe_squared);
}

/**
 * 전자 사이클로트론 주파수 (자기장이 있는 경우)
 * ω_ce = eB / m_e
 * @param {number} magneticField - 자기장 세기 (T)
 * @returns {number} 사이클로트론 주파수 (rad/s)
 */
export function calculateCyclotronFrequency(magneticField) {
  return (CONSTANTS.ELECTRON_CHARGE * magneticField) / CONSTANTS.ELECTRON_MASS;
}

/**
 * 데바이 길이 계산
 * λ_D = √(ε_0 × k_B × T_e / (n_e × e²))
 * @param {number} electronTemp - 전자 온도 (eV)
 * @param {number} electronDensity - 전자 밀도 (m^-3)
 * @returns {number} 데바이 길이 (m)
 */
export function calculateDebyeLength(electronTemp, electronDensity) {
  const T_joule = electronTemp * CONSTANTS.EV_TO_JOULE;
  const lambda_D_squared = (CONSTANTS.EPSILON_0 * T_joule) /
                           (electronDensity * CONSTANTS.ELECTRON_CHARGE * CONSTANTS.ELECTRON_CHARGE);
  return Math.sqrt(lambda_D_squared);
}

/**
 * 이온화 빈도 계산
 * ν_iz = n_g × σ_iz × v_e
 * @param {number} energy - 전자 에너지 (eV)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {number} ionizationCrossSection - 이온화 단면적 (m^2)
 * @returns {number} 이온화 빈도 (Hz)
 */
export function calculateIonizationFrequency(energy, gasDensity, ionizationCrossSection) {
  if (energy < ARGON_PROPERTIES.IONIZATION_ENERGY) return 0;
  return calculateCollisionFrequency(energy, gasDensity, ionizationCrossSection);
}

/**
 * 여기 빈도 계산
 * @param {number} energy - 전자 에너지 (eV)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {number} excitationCrossSection - 여기 단면적 (m^2)
 * @param {number} excitationEnergy - 여기 에너지 (eV)
 * @returns {number} 여기 빈도 (Hz)
 */
export function calculateExcitationFrequency(energy, gasDensity, excitationCrossSection, excitationEnergy) {
  if (energy < excitationEnergy) return 0;
  return calculateCollisionFrequency(energy, gasDensity, excitationCrossSection);
}

/**
 * 전자 온도 계산 (평균 에너지로부터)
 * T_e = (2/3) × <E>
 * @param {number} averageEnergy - 평균 전자 에너지 (eV)
 * @returns {number} 전자 온도 (eV)
 */
export function calculateElectronTemperature(averageEnergy) {
  return (2 / 3) * averageEnergy;
}

/**
 * 맥스웰 분포에서의 속도 샘플링
 * @param {number} temperature - 온도 (eV)
 * @returns {number} 속도 (m/s)
 */
export function sampleMaxwellianVelocity(temperature) {
  // Box-Muller 변환으로 가우시안 난수 생성
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // 열 속도
  const T_joule = temperature * CONSTANTS.EV_TO_JOULE;
  const v_th = Math.sqrt(T_joule / CONSTANTS.ELECTRON_MASS);
  
  return v_th * z;
}

/**
 * 드리프트 속도 계산
 * v_d = μ × E
 * @param {number} mobility - 이동도 (m²/(V·s))
 * @param {number} electricField - 전기장 (V/m)
 * @returns {number} 드리프트 속도 (m/s)
 */
export function calculateDriftVelocity(mobility, electricField) {
  return mobility * electricField;
}

/**
 * 전자 이동도 계산 (간단한 모델)
 * μ = e / (m_e × ν_m)
 * @param {number} collisionFrequency - 충돌 빈도 (Hz)
 * @returns {number} 이동도 (m²/(V·s))
 */
export function calculateElectronMobility(collisionFrequency) {
  if (collisionFrequency === 0) return Infinity;
  return CONSTANTS.ELECTRON_CHARGE / (CONSTANTS.ELECTRON_MASS * collisionFrequency);
}

/**
 * 확산 계수 계산
 * D = (k_B × T) / (m × ν_m)
 * @param {number} temperature - 온도 (eV)
 * @param {number} collisionFrequency - 충돌 빈도 (Hz)
 * @returns {number} 확산 계수 (m²/s)
 */
export function calculateDiffusionCoefficient(temperature, collisionFrequency) {
  if (collisionFrequency === 0) return Infinity;
  const T_joule = temperature * CONSTANTS.EV_TO_JOULE;
  return T_joule / (CONSTANTS.ELECTRON_MASS * collisionFrequency);
}

/**
 * 모든 충돌 빈도 계산
 * @param {number} energy - 전자 에너지 (eV)
 * @param {number} gasDensity - 가스 밀도 (m^-3)
 * @param {Object} crossSections - 단면적 객체
 * @returns {Object} 모든 충돌 빈도
 */
export function calculateAllFrequencies(energy, gasDensity, crossSections) {
  const velocity = getElectronVelocity(energy);
  
  return {
    elastic: gasDensity * crossSections.elastic * velocity,
    excitation_1s: gasDensity * crossSections.excitation_1s * velocity,
    excitation_2p: gasDensity * crossSections.excitation_2p * velocity,
    excitation_high: gasDensity * crossSections.excitation_high * velocity,
    ionization: gasDensity * crossSections.ionization * velocity,
    total: gasDensity * (crossSections.elastic + crossSections.excitation_1s + 
                        crossSections.excitation_2p + crossSections.excitation_high + 
                        crossSections.ionization) * velocity
  };
}

export default {
  calculateCollisionFrequency,
  getElectronVelocity,
  calculateMeanFreePath,
  calculateMeanCollisionTime,
  calculatePlasmaFrequency,
  calculateCyclotronFrequency,
  calculateDebyeLength,
  calculateIonizationFrequency,
  calculateExcitationFrequency,
  calculateElectronTemperature,
  sampleMaxwellianVelocity,
  calculateDriftVelocity,
  calculateElectronMobility,
  calculateDiffusionCoefficient,
  calculateAllFrequencies
};