/**
 * BEB (Binary-Encounter-Bethe) Model
 * 전자 충돌 이온화 단면적 이론 계산
 * 
 * 참고문헌:
 * Kim & Rudd (1994), "Binary-encounter-dipole model for electron-impact ionization"
 * Phys. Rev. A 50, 3954
 */

import { CONSTANTS, BEB_PARAMETERS } from './constants';

/**
 * BEB 모델을 이용한 이온화 단면적 계산
 * @param {number} T - 입사 전자 에너지 (eV)
 * @param {number} B - 결합 에너지 (eV)
 * @param {number} U - 평균 운동 에너지 (eV)
 * @param {number} N - 껍질의 전자 개수
 * @returns {number} 이온화 단면적 (m^2)
 */
export function calculateBEBCrossSection(T, B, U, N) {
  // 에너지가 결합 에너지보다 작으면 이온화 불가
  if (T < B) return 0;
  
  // 무차원 변수 정의
  const t = T / B;  // 환산 에너지
  const u = U / B;  // 환산 운동 에너지
  
  // BEB 공식
  // σ = (4πa₀²)(N/B²) × S(t,u)
  // S(t,u) = [ln(t)/2] × [1 - 1/t²] + [1 - 1/t - ln(t)/(t+1)]
  
  // 보어 반지름의 제곱 (m^2)
  const a0_squared = 2.8e-21;  // (0.529 Å)^2
  
  // S 함수 계산
  const lnt = Math.log(t);
  const term1 = (lnt / 2) * (1 - 1 / (t * t));
  const term2 = 1 - 1/t - lnt / (t + 1);
  const S = term1 + term2;
  
  // 최종 단면적 (m^2)
  const sigma = (4 * Math.PI * a0_squared * N / (B * B)) * S;
  
  return sigma;
}

/**
 * 아르곤의 전체 이온화 단면적 계산 (모든 껍질 고려)
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {number} 전체 이온화 단면적 (m^2)
 */
export function calculateArgonIonizationCrossSection(energy) {
  let totalSigma = 0;
  
  // 각 껍질별로 BEB 단면적 계산
  for (const [shell, params] of Object.entries(BEB_PARAMETERS)) {
    const sigma = calculateBEBCrossSection(
      energy,
      params.B,
      params.U,
      params.N
    );
    totalSigma += sigma;
  }
  
  return totalSigma;
}

/**
 * 여기 단면적 근사 계산
 * Born-Bethe 근사를 사용한 간단한 모델
 * @param {number} T - 입사 전자 에너지 (eV)
 * @param {number} E_exc - 여기 에너지 (eV)
 * @param {number} f - 진동자 세기 (oscillator strength)
 * @returns {number} 여기 단면적 (m^2)
 */
export function calculateExcitationCrossSection(T, E_exc, f = 0.1) {
  // 에너지가 여기 에너지보다 작으면 여기 불가
  if (T < E_exc) return 0;
  
  // Born-Bethe 근사
  // σ ≈ (4πa₀²) × (R/E_exc) × f × ln(T/E_exc)
  // R: Rydberg 에너지 (13.6 eV)
  
  const a0_squared = 2.8e-21;  // m^2
  const R = 13.6;  // eV
  
  const sigma = (4 * Math.PI * a0_squared) * (R / E_exc) * f * Math.log(T / E_exc);
  
  return Math.max(sigma, 0);
}

/**
 * 아르곤 1S 여기 단면적
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {number} 1S 여기 단면적 (m^2)
 */
export function calculateArgon1SExcitation(energy) {
  const E_1s = 11.55;  // eV
  const f_1s = 0.25;   // 진동자 세기 (근사)
  return calculateExcitationCrossSection(energy, E_1s, f_1s);
}

/**
 * 아르곤 2P 여기 단면적
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {number} 2P 여기 단면적 (m^2)
 */
export function calculateArgon2PExcitation(energy) {
  const E_2p = 12.91;  // eV
  const f_2p = 0.15;   // 진동자 세기 (근사)
  return calculateExcitationCrossSection(energy, E_2p, f_2p);
}

/**
 * 탄성 충돌 단면적 근사
 * Screening Coulomb 모델
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {number} 탄성 충돌 단면적 (m^2)
 */
export function calculateElasticCrossSection(energy) {
  // 저에너지 근사: σ_el ∝ 1/E
  // 고에너지에서는 감소
  
  const a0 = 5.29e-11;  // 보어 반지름 (m)
  const Z = 18;         // 아르곤 원자 번호
  
  // Screening 파라미터
  const a = 0.5 * a0;   // screening length
  
  // Mott 단면적 근사
  const E_joule = energy * CONSTANTS.EV_TO_JOULE;
  const k = Math.sqrt(2 * CONSTANTS.ELECTRON_MASS * E_joule) / CONSTANTS.PLANCK;
  
  // 간단한 근사식
  const sigma = Math.PI * a * a * (Z * Z) / (1 + (k * a) * (k * a));
  
  return sigma;
}

/**
 * 이차 전자 에너지 분포
 * 이온화 시 생성되는 이차 전자의 에너지 결정
 * @param {number} primaryEnergy - 1차 전자 에너지 (eV)
 * @param {number} ionizationEnergy - 이온화 에너지 (eV)
 * @param {number} random - 0~1 난수
 * @returns {Object} {primaryNew, secondary} 이차 전자 에너지들
 */
export function calculateSecondaryElectronEnergy(primaryEnergy, ionizationEnergy, random) {
  // 사용 가능한 에너지
  const availableEnergy = primaryEnergy - ionizationEnergy;
  
  if (availableEnergy <= 0) {
    return {
      primaryNew: 0,
      secondary: 0
    };
  }
  
  // Opal-Beaty-Peterson 분포 근사
  // 이차 전자는 보통 저에너지를 가짐
  // P(E) ∝ 1/E² 분포
  
  // 역변환 샘플링
  const E_min = 0.1;  // 최소 에너지 (eV)
  const E_max = availableEnergy / 2;  // 최대 에너지 (에너지 보존)
  
  if (E_max <= E_min) {
    // 에너지가 너무 작으면 균등 분배
    const half = availableEnergy / 2;
    return {
      primaryNew: half,
      secondary: half
    };
  }
  
  // 1/E² 분포에서 샘플링
  const secondaryEnergy = E_min / (1 - random * (1 - E_min / E_max));
  const primaryNew = availableEnergy - secondaryEnergy;
  
  return {
    primaryNew: Math.max(primaryNew, 0),
    secondary: Math.max(secondaryEnergy, 0)
  };
}

/**
 * BEB 모델 전체 단면적 세트 계산
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {Object} 모든 충돌 유형의 단면적
 */
export function calculateAllBEBCrossSections(energy) {
  return {
    elastic: calculateElasticCrossSection(energy),
    excitation_1s: calculateArgon1SExcitation(energy),
    excitation_2p: calculateArgon2PExcitation(energy),
    excitation_high: 0,  // 고준위는 간단히 0으로 (필요시 추가)
    ionization: calculateArgonIonizationCrossSection(energy)
  };
}

/**
 * BEB vs Experimental 데이터 비교
 * @param {number} energy - 전자 에너지 (eV)
 * @param {Object} experimentalCS - 실험 단면적 데이터
 * @returns {Object} 비교 결과
 */
export function compareBEBWithExperiment(energy, experimentalCS) {
  const bebCS = calculateAllBEBCrossSections(energy);
  
  return {
    energy: energy,
    beb: bebCS,
    experimental: experimentalCS,
    ratios: {
      ionization: experimentalCS.ionization > 0 ? 
        bebCS.ionization / experimentalCS.ionization : null
    }
  };
}

export default {
  calculateBEBCrossSection,
  calculateArgonIonizationCrossSection,
  calculateExcitationCrossSection,
  calculateArgon1SExcitation,
  calculateArgon2PExcitation,
  calculateElasticCrossSection,
  calculateSecondaryElectronEnergy,
  calculateAllBEBCrossSections,
  compareBEBWithExperiment
};