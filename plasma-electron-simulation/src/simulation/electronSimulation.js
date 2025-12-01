// Monte Carlo 전자 시뮬레이션
import { ARGON_DATA, SIMULATION_CONFIG, velocityFromEnergy, energyFromVelocity, PHYSICAL_CONSTANTS } from './constants';
import { getCrossSections, getTotalCrossSection, selectCollisionType, getMeanFreePath } from './crossSections';
import { getTimeToCollision, calculateCollisionFrequency } from './frequencies';

/**
 * 단일 전자 시뮬레이션
 */
class ElectronTracker {
  constructor(initialEnergy, gasDensity, csvData, params) {
    this.energy = initialEnergy;
    this.gasDensity = gasDensity;
    this.csvData = csvData;
    this.params = params;
    
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = this.getRandomVelocity(initialEnergy);
    
    this.ionizations = 0;
    this.collisions = 0;
    this.totalTime = 0;
    this.isActive = true;
    
    this.collisionHistory = [];
  }
  
  getRandomVelocity(energy) {
    const speed = velocityFromEnergy(energy);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();
    
    return {
      x: speed * Math.sin(theta) * Math.cos(phi),
      y: speed * Math.sin(theta) * Math.sin(phi),
      z: speed * Math.cos(theta)
    };
  }
  
  getSpeed() {
    return Math.sqrt(
      this.velocity.x ** 2 + 
      this.velocity.y ** 2 + 
      this.velocity.z ** 2
    );
  }
  
  updateEnergy() {
    const speed = this.getSpeed();
    this.energy = energyFromVelocity(speed);
  }
  
  moveElectron(dt) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    this.totalTime += dt;
  }
  
  checkWallCollision(chamberSize) {
    const halfSize = chamberSize / 2;
    
    if (Math.abs(this.position.x) > halfSize ||
        Math.abs(this.position.y) > halfSize ||
        Math.abs(this.position.z) > halfSize) {
      
      // 벽 충돌 - 흡수 확률
      if (Math.random() < SIMULATION_CONFIG.WALL_ABSORPTION_PROBABILITY) {
        this.isActive = false;
        return true;
      }
      
      // 반사
      if (Math.abs(this.position.x) > halfSize) {
        this.velocity.x *= -1;
        this.position.x = Math.sign(this.position.x) * halfSize;
      }
      if (Math.abs(this.position.y) > halfSize) {
        this.velocity.y *= -1;
        this.position.y = Math.sign(this.position.y) * halfSize;
      }
      if (Math.abs(this.position.z) > halfSize) {
        this.velocity.z *= -1;
        this.position.z = Math.sign(this.position.z) * halfSize;
      }
      
      return true;
    }
    
    return false;
  }
  
  performCollision() {
    const crossSections = getCrossSections(this.energy, this.csvData);
    const totalSigma = getTotalCrossSection(crossSections);
    
    if (totalSigma === 0) {
      this.isActive = false;
      return null;
    }
    
    const collisionType = selectCollisionType(crossSections, Math.random());
    this.collisions++;
    
    this.collisionHistory.push({
      time: this.totalTime,
      energy: this.energy,
      type: collisionType
    });
    
    switch (collisionType) {
      case 'elastic':
        this.handleElasticCollision();
        break;
      case 'excitation_1s':
        this.handleExcitation(ARGON_DATA.EXCITATION_1S);
        break;
      case 'excitation_2p':
        this.handleExcitation(ARGON_DATA.EXCITATION_2P);
        break;
      case 'excitation_high':
        this.handleExcitation(ARGON_DATA.EXCITATION_HIGH);
        break;
      case 'ionization':
        this.handleIonization();
        break;
    }
    
    return collisionType;
  }
  
  handleElasticCollision() {
    // 탄성 충돌 - 운동량 보존
    const me = PHYSICAL_CONSTANTS.ELECTRON_MASS;
    const mAr = PHYSICAL_CONSTANTS.ARGON_MASS;
    
    // 에너지 손실 (평균)
    const energyLoss = 2 * me / mAr * this.energy;
    this.energy = Math.max(0, this.energy - energyLoss);
    
    // 속도 방향 랜덤하게 변경
    this.velocity = this.getRandomVelocity(this.energy);
  }
  
  handleExcitation(excitationEnergy) {
    this.energy -= excitationEnergy;
    
    if (this.energy < SIMULATION_CONFIG.MIN_ENERGY_THRESHOLD) {
      this.isActive = false;
      return;
    }
    
    this.velocity = this.getRandomVelocity(this.energy);
  }
  
  handleIonization() {
    this.ionizations++;
    this.energy -= ARGON_DATA.IONIZATION_ENERGY;
    
    if (this.energy < SIMULATION_CONFIG.MIN_ENERGY_THRESHOLD) {
      this.isActive = false;
      return;
    }
    
    // 2차 전자 생성 (간단한 모델)
    const secondaryEnergy = Math.random() * Math.min(this.energy * 0.5, 10);
    this.energy -= secondaryEnergy;
    
    this.velocity = this.getRandomVelocity(this.energy);
  }
  
  simulate() {
    const maxCollisions = this.params.maxCollisions || SIMULATION_CONFIG.DEFAULT_MAX_COLLISIONS;
    const chamberSize = Math.cbrt(this.params.chamberVolume);
    
    while (this.isActive && this.collisions < maxCollisions) {
      // 에너지가 너무 낮으면 종료
      if (this.energy < SIMULATION_CONFIG.MIN_ENERGY_THRESHOLD) {
        this.isActive = false;
        break;
      }
      
      // 충돌 단면적 계산
      const crossSections = getCrossSections(this.energy, this.csvData);
      const totalSigma = getTotalCrossSection(crossSections);
      
      if (totalSigma === 0) {
        this.isActive = false;
        break;
      }
      
      // 충돌 빈도 계산
      const collisionFreq = calculateCollisionFrequency(this.energy, totalSigma, this.gasDensity);
      
      if (collisionFreq === 0) {
        this.isActive = false;
        break;
      }
      
      // 다음 충돌까지의 시간
      const timeToCollision = getTimeToCollision(collisionFreq, Math.random());
      
      // 전자 이동
      this.moveElectron(timeToCollision);
      
      // 벽 충돌 체크
      if (this.checkWallCollision(chamberSize)) {
        if (!this.isActive) break;
      }
      
      // 가스 충돌 수행
      this.performCollision();
    }
    
    return {
      ionizations: this.ionizations,
      collisions: this.collisions,
      finalEnergy: this.energy,
      totalTime: this.totalTime,
      collisionHistory: this.collisionHistory
    };
  }
}

/**
 * Monte Carlo 시뮬레이션 실행
 */
export const runMonteCarloSimulation = async (csvData, params, progressCallback) => {
  const results = {
    electrons: [],
    ionizationDistribution: [],
    avgIonizations: 0,
    maxIonizations: 0,
    avgCollisions: 0,
    wallAbsorptionRate: 0,
    totalIonizations: 0
  };
  
  const numElectrons = params.numElectrons || 10000;
  const batchSize = 100;
  
  for (let i = 0; i < numElectrons; i += batchSize) {
    const currentBatch = Math.min(batchSize, numElectrons - i);
    
    for (let j = 0; j < currentBatch; j++) {
      const electron = new ElectronTracker(
        params.initialEnergy,
        params.gasDensity,
        csvData,
        params
      );
      
      const result = electron.simulate();
      results.electrons.push(result);
      results.totalIonizations += result.ionizations;
      
      if (result.ionizations > results.maxIonizations) {
        results.maxIonizations = result.ionizations;
      }
    }
    
    // 진행률 업데이트
    const progress = Math.floor(((i + currentBatch) / numElectrons) * 100);
    if (progressCallback) {
      progressCallback(progress);
    }
    
    // UI 업데이트를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  // 통계 계산
  results.avgIonizations = results.totalIonizations / numElectrons;
  results.avgCollisions = results.electrons.reduce((sum, e) => sum + e.collisions, 0) / numElectrons;
  
  const wallAbsorbed = results.electrons.filter(e => e.finalEnergy < SIMULATION_CONFIG.MIN_ENERGY_THRESHOLD).length;
  results.wallAbsorptionRate = wallAbsorbed / numElectrons;
  
  // 이온화 분포 생성
  results.ionizationDistribution = new Array(results.maxIonizations + 1).fill(0);
  results.electrons.forEach(e => {
    results.ionizationDistribution[e.ionizations]++;
  });
  
  return results;
};