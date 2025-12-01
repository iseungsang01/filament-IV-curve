/**
 * Cross Section Utilities
 * CSV 데이터 기반 충돌 단면적 계산 및 보간
 */

/**
 * 선형 보간 함수
 */
function linearInterpolate(x, x1, x2, y1, y2) {
  if (x2 === x1) return y1;
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
}

/**
 * CrossSectionData 클래스
 * CSV 데이터를 기반으로 각 에너지에서의 단면적을 계산
 */
export class CrossSectionData {
  constructor(csvData) {
    if (!csvData) {
      throw new Error('CSV data is required');
    }
    
    this.energy = csvData.energy || [];
    this.sigma_1s = csvData.sigma_1s || [];
    this.sigma_2p = csvData.sigma_2p || [];
    this.sigma_high = csvData.sigma_high || [];
    this.sigma_iz = csvData.sigma_iz || [];
    
    // 데이터 검증
    this.validate();
    
    // 탄성 충돌 단면적 계산 (근사)
    this.sigma_elastic = this.calculateElasticCrossSection();
  }
  
  /**
   * 데이터 유효성 검사
   */
  validate() {
    const n = this.energy.length;
    if (n === 0) {
      throw new Error('Empty cross section data');
    }
    
    if (this.sigma_1s.length !== n || 
        this.sigma_2p.length !== n || 
        this.sigma_high.length !== n || 
        this.sigma_iz.length !== n) {
      throw new Error('Inconsistent cross section data lengths');
    }
    
    // 에너지가 오름차순인지 확인
    for (let i = 1; i < n; i++) {
      if (this.energy[i] <= this.energy[i-1]) {
        console.warn('Energy values are not strictly increasing');
        break;
      }
    }
  }
  
  /**
   * 탄성 충돌 단면적 근사 계산
   * 일반적으로 전체 단면적에서 비탄성 단면적을 뺀 값
   */
  calculateElasticCrossSection() {
    const elastic = [];
    for (let i = 0; i < this.energy.length; i++) {
      // 저에너지에서 탄성 충돌이 지배적
      // 간단한 모델: 10^-19 m^2 정도로 근사
      const totalInelastic = this.sigma_1s[i] + this.sigma_2p[i] + 
                            this.sigma_high[i] + this.sigma_iz[i];
      
      // 탄성 단면적 = 전체 단면적 - 비탄성 단면적
      // 저에너지에서는 일정값, 고에너지에서 감소
      const E = this.energy[i];
      const elasticBase = 1e-19; // 기본 탄성 단면적 (m^2)
      const elasticEnergy = elasticBase * Math.exp(-E / 100); // 에너지 의존성
      
      elastic.push(Math.max(elasticEnergy, totalInelastic * 0.1));
    }
    return elastic;
  }
  
  /**
   * 주어진 에너지에서 각 유형의 단면적을 보간하여 반환
   */
  getCrossSections(energy) {
    // 에너지 범위 체크
    if (energy < this.energy[0]) {
      // 최소 에너지 이하: 외삽 (첫 값 사용)
      return {
        elastic: this.sigma_elastic[0],
        excitation_1s: this.sigma_1s[0],
        excitation_2p: this.sigma_2p[0],
        excitation_high: this.sigma_high[0],
        ionization: this.sigma_iz[0]
      };
    }
    
    if (energy > this.energy[this.energy.length - 1]) {
      // 최대 에너지 초과: 외삽 (마지막 값 사용)
      const last = this.energy.length - 1;
      return {
        elastic: this.sigma_elastic[last],
        excitation_1s: this.sigma_1s[last],
        excitation_2p: this.sigma_2p[last],
        excitation_high: this.sigma_high[last],
        ionization: this.sigma_iz[last]
      };
    }
    
    // 선형 보간
    let idx = 0;
    for (let i = 0; i < this.energy.length - 1; i++) {
      if (energy >= this.energy[i] && energy <= this.energy[i + 1]) {
        idx = i;
        break;
      }
    }
    
    const E1 = this.energy[idx];
    const E2 = this.energy[idx + 1];
    
    return {
      elastic: linearInterpolate(energy, E1, E2, 
                this.sigma_elastic[idx], this.sigma_elastic[idx + 1]),
      excitation_1s: linearInterpolate(energy, E1, E2, 
                this.sigma_1s[idx], this.sigma_1s[idx + 1]),
      excitation_2p: linearInterpolate(energy, E1, E2, 
                this.sigma_2p[idx], this.sigma_2p[idx + 1]),
      excitation_high: linearInterpolate(energy, E1, E2, 
                this.sigma_high[idx], this.sigma_high[idx + 1]),
      ionization: linearInterpolate(energy, E1, E2, 
                this.sigma_iz[idx], this.sigma_iz[idx + 1])
    };
  }
  
  /**
   * 전체 단면적 계산 (모든 유형의 합)
   */
  getTotalCrossSection(energy) {
    const cs = this.getCrossSections(energy);
    return cs.elastic + cs.excitation_1s + cs.excitation_2p + 
           cs.excitation_high + cs.ionization;
  }
  
  /**
   * 충돌 유형 선택 (확률적)
   * @param {number} energy - 전자 에너지 (eV)
   * @param {number} random - 0~1 사이의 난수
   * @returns {string} 충돌 유형
   */
  selectCollisionType(energy, random) {
    const cs = this.getCrossSections(energy);
    const total = cs.elastic + cs.excitation_1s + cs.excitation_2p + 
                  cs.excitation_high + cs.ionization;
    
    if (total === 0) return 'elastic';
    
    // 누적 확률 계산
    let cumulative = 0;
    const threshold = random * total;
    
    cumulative += cs.elastic;
    if (threshold < cumulative) return 'elastic';
    
    cumulative += cs.excitation_1s;
    if (threshold < cumulative) return 'excitation_1s';
    
    cumulative += cs.excitation_2p;
    if (threshold < cumulative) return 'excitation_2p';
    
    cumulative += cs.excitation_high;
    if (threshold < cumulative) return 'excitation_high';
    
    return 'ionization';
  }
  
  /**
   * 평균 자유 행로 계산
   * λ = 1 / (n * σ)
   * @param {number} energy - 전자 에너지 (eV)
   * @param {number} gasDensity - 가스 밀도 (m^-3)
   * @returns {number} 평균 자유 행로 (m)
   */
  getMeanFreePath(energy, gasDensity) {
    const sigma = this.getTotalCrossSection(energy);
    if (sigma === 0 || gasDensity === 0) return Infinity;
    return 1 / (gasDensity * sigma);
  }
  
  /**
   * 충돌 빈도 계산
   * ν = n * σ * v
   * @param {number} energy - 전자 에너지 (eV)
   * @param {number} gasDensity - 가스 밀도 (m^-3)
   * @returns {number} 충돌 빈도 (Hz)
   */
  getCollisionFrequency(energy, gasDensity) {
    const ELECTRON_MASS = 9.10938e-31; // kg
    const EV_TO_JOULE = 1.60218e-19;
    
    const sigma = this.getTotalCrossSection(energy);
    const velocity = Math.sqrt(2 * energy * EV_TO_JOULE / ELECTRON_MASS);
    
    return gasDensity * sigma * velocity;
  }
  
  /**
   * 데이터 요약 정보
   */
  getSummary() {
    return {
      energyRange: {
        min: this.energy[0],
        max: this.energy[this.energy.length - 1]
      },
      numPoints: this.energy.length,
      maxCrossSections: {
        elastic: Math.max(...this.sigma_elastic),
        excitation_1s: Math.max(...this.sigma_1s),
        excitation_2p: Math.max(...this.sigma_2p),
        excitation_high: Math.max(...this.sigma_high),
        ionization: Math.max(...this.sigma_iz)
      }
    };
  }
}

/**
 * CSV 데이터로부터 CrossSectionData 객체 생성
 */
export function createCrossSectionData(csvData) {
  return new CrossSectionData(csvData);
}

export default {
  CrossSectionData,
  createCrossSectionData
};