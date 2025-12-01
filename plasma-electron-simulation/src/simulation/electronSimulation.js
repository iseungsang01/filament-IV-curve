/**
 * Electron Monte Carlo Simulation
 * 플라즈마에서 전자의 충돌 과정을 Monte Carlo 방법으로 시뮬레이션
 */

import { CONSTANTS, ARGON_PROPERTIES, SIMULATION_DEFAULTS } from './constants';
import { calculateSecondaryElectronEnergy } from './bebModel';

/**
 * 단일 전자 추적
 * @param {number} initialEnergy - 초기 에너지 (eV)
 * @param {Object} crossSectionData - 단면적 데이터 객체
 * @param {Object} params - 시뮬레이션 파라미터
 * @returns {Object} 전자 추적 결과
 */
export function traceElectron(initialEnergy, crossSectionData, params) {
  const {
    gasDensity,
    plasmaVoltage,
    chamberVolume,
    wallArea
  } = params;
  
  let energy = initialEnergy;
  let position = { x: 0, y: 0, z: 0 };  // 초기 위치
  let velocity = getVelocityFromEnergy(energy);
  
  const collisions = [];
  let ionizationCount = 0;
  let excitationCount = 0;
  let totalDistance = 0;
  let time = 0;
  
  const MAX_COLLISIONS = 1000;
  const MIN_ENERGY = 0.1;  // eV
  const MAX_TIME = 1e-6;   // 1 μs
  
  // 충돌 루프
  for (let i = 0; i < MAX_COLLISIONS; i++) {
    // 에너지가 너무 낮으면 중단
    if (energy < MIN_ENERGY) {
      break;
    }
    
    // 시간 제한
    if (time > MAX_TIME) {
      break;
    }
    
    // 평균 자유 행로 계산
    const mfp = crossSectionData.getMeanFreePath(energy, gasDensity);
    
    // 충돌까지의 거리 샘플링 (지수 분포)
    const distance = -mfp * Math.log(Math.random());
    totalDistance += distance;
    
    // 시간 증가
    const v = getVelocityFromEnergy(energy);
    time += distance / v;
    
    // 위치 업데이트 (간단히 1D로 근사)
    position.z += distance;
    
    // 벽면 충돌 체크 (간단한 모델)
    const chamberRadius = Math.sqrt(chamberVolume / Math.PI);
    if (Math.abs(position.z) > chamberRadius) {
      // 벽면에 흡수됨
      break;
    }
    
    // 충돌 유형 결정
    const collisionType = crossSectionData.selectCollisionType(energy, Math.random());
    
    const collisionEvent = {
      type: collisionType,
      energyBefore: energy,
      position: { ...position },
      time: time
    };
    
    // 충돌에 따른 에너지 손실 처리
    switch (collisionType) {
      case 'elastic':
        // 탄성 충돌: 에너지 손실 작음 (전자-원자 질량비 고려)
        const elasticLoss = calculateElasticEnergyLoss(energy);
        energy -= elasticLoss;
        break;
        
      case 'excitation_1s':
        // 1S 여기
        energy -= 11.55;  // eV
        excitationCount++;
        break;
        
      case 'excitation_2p':
        // 2P 여기
        energy -= 12.91;  // eV
        excitationCount++;
        break;
        
      case 'excitation_high':
        // 고준위 여기
        energy -= 13.5;  // eV (평균)
        excitationCount++;
        break;
        
      case 'ionization':
        // 이온화
        const ionizationEnergy = ARGON_PROPERTIES.IONIZATION_ENERGY;
        
        if (energy > ionizationEnergy) {
          ionizationCount++;
          
          // 이차 전자 생성
          const { primaryNew, secondary } = calculateSecondaryElectronEnergy(
            energy, 
            ionizationEnergy, 
            Math.random()
          );
          
          energy = primaryNew;
          
          collisionEvent.secondary = secondary;
        } else {
          energy = 0;
        }
        break;
    }
    
    collisionEvent.energyAfter = energy;
    collisionEvent.energyLoss = collisionEvent.energyBefore - energy;
    collisions.push(collisionEvent);
    
    // 에너지가 음수가 되면 중단
    if (energy <= 0) {
      break;
    }
  }
  
  return {
    initialEnergy,
    finalEnergy: energy,
    ionizationCount,
    excitationCount,
    collisions,
    totalDistance,
    totalTime: time,
    absorbed: energy < MIN_ENERGY
  };
}

/**
 * 탄성 충돌에서의 에너지 손실 계산
 * @param {number} energy - 전자 에너지 (eV)
 * @returns {number} 에너지 손실 (eV)
 */
function calculateElasticEnergyLoss(energy) {
  // 전자-아르곤 탄성 충돌
  // 평균 에너지 손실: ΔE = 2(m_e/M_Ar) × E × (1 - cos(θ))
  // 간단한 근사: 평균적으로 매우 작은 손실
  
  const massRatio = CONSTANTS.ELECTRON_MASS / CONSTANTS.ARGON_MASS;
  const averageCosTheta = 0.5;  // 평균 산란각
  const energyLoss = 2 * massRatio * energy * (1 - averageCosTheta);
  
  return energyLoss;
}

/**
 * 에너지로부터 속도 계산
 * @param {number} energy - 에너지 (eV)
 * @returns {number} 속도 (m/s)
 */
function getVelocityFromEnergy(energy) {
  const energyJoule = energy * CONSTANTS.EV_TO_JOULE;
  return Math.sqrt(2 * energyJoule / CONSTANTS.ELECTRON_MASS);
}

/**
 * 전체 시뮬레이션 실행
 * @param {Object} params - 시뮬레이션 파라미터
 * @param {Object} crossSectionData - 단면적 데이터
 * @param {Function} onProgress - 진행률 콜백
 * @returns {Promise<Object>} 시뮬레이션 결과
 */
export async function runSimulation(params, crossSectionData, onProgress = null) {
  const {
    initialEnergy,
    numElectrons,
    gasDensity,
    plasmaVoltage,
    chamberVolume,
    wallArea
  } = params;
  
  const results = {
    electrons: [],
    ionizations: [],
    excitations: [],
    energyLosses: [],
    collisionCounts: []
  };
  
  // 각 전자 시뮬레이션
  for (let i = 0; i < numElectrons; i++) {
    const electronResult = traceElectron(initialEnergy, crossSectionData, params);
    
    results.electrons.push(electronResult);
    results.ionizations.push(electronResult.ionizationCount);
    results.excitations.push(electronResult.excitationCount);
    results.energyLosses.push(initialEnergy - electronResult.finalEnergy);
    results.collisionCounts.push(electronResult.collisions.length);
    
    // 진행률 업데이트
    if (onProgress && i % 10 === 0) {
      const progress = ((i + 1) / numElectrons) * 100;
      await onProgress(progress);
      
      // UI 업데이트를 위한 작은 지연
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
  
  // 통계 계산
  results.statistics = calculateStatistics(results);
  
  return results;
}

/**
 * 결과 통계 계산
 * @param {Object} results - 시뮬레이션 결과
 * @returns {Object} 통계
 */
function calculateStatistics(results) {
  const { ionizations, excitations, energyLosses, collisionCounts } = results;
  
  return {
    ionization: {
      mean: mean(ionizations),
      std: standardDeviation(ionizations),
      max: Math.max(...ionizations),
      min: Math.min(...ionizations),
      total: sum(ionizations)
    },
    excitation: {
      mean: mean(excitations),
      std: standardDeviation(excitations),
      total: sum(excitations)
    },
    energyLoss: {
      mean: mean(energyLosses),
      std: standardDeviation(energyLosses)
    },
    collisions: {
      mean: mean(collisionCounts),
      std: standardDeviation(collisionCounts),
      max: Math.max(...collisionCounts),
      min: Math.min(...collisionCounts)
    },
    survivalRate: results.electrons.filter(e => !e.absorbed).length / results.electrons.length
  };
}

// 유틸리티 함수들
function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function standardDeviation(arr) {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

export default {
  traceElectron,
  runSimulation,
  calculateStatistics
};