import { savgolFilter, gradient } from './dataProcessing';
import { linearFit, exponentialFit, fitCLModel } from './fitting';
import { calculateIonDensity, calculateElectronDensity, CLModel } from './calculations';

export const performFullAnalysis = (voltage, current) => {
  const maxIterations = 10;
  const tolerance = 1e-5;
  
  let VpOld = 0;
  let VpNew = 100;
  let iterationCount = 0;
  let iCurrentToAnalyze = [...current];
  let iIonFit = new Array(current.length).fill(0);
  const iterationHistory = [];
  
  // 초기 Te 계산
  const smoothCurrent = savgolFilter(current);
  const dIdV = gradient(smoothCurrent, voltage);
  const maxIdx = dIdV.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
  let VpGuess = voltage[maxIdx];
  
  // Te 계산을 위한 전자 전류 분리
  const retardingData = [];
  for (let i = 0; i < voltage.length; i++) {
    if (voltage[i] <= VpGuess && voltage[i] >= VpGuess - 0.8 && iCurrentToAnalyze[i] > 0) {
      retardingData.push({ v: voltage[i], logI: Math.log(iCurrentToAnalyze[i]) });
    }
  }
  
  const teFit = retardingData.length > 5 ? 
    linearFit(retardingData.map(d => d.v), retardingData.map(d => d.logI)) : 
    { m: 0.5, c: -10 };
  
  const Te = 1 / teFit.m;
  
  console.log('Fixed Te:', Te);
  
  // 반복 루프
  while (Math.abs(VpNew - VpOld) > tolerance && iterationCount < maxIterations) {
    iterationCount++;
    VpOld = VpNew;
    
    // Step 1: dI/dV로 Vp 찾기
    const smoothed = savgolFilter(iCurrentToAnalyze);
    const derivative = gradient(smoothed, voltage);
    const peakIdx = derivative.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const VpDerivative = voltage[peakIdx];
    
    // Step 2: Log-log 교점법으로 Vp 보정
    const iPositive = iCurrentToAnalyze.map(c => c > 0 ? c : null);
    const retarding = [];
    const saturation = [];
    
    for (let i = 0; i < voltage.length; i++) {
      if (iPositive[i] && voltage[i] < VpDerivative - 0.1 && voltage[i] > VpDerivative - 0.8) {
        retarding.push({ v: voltage[i], logI: Math.log(iPositive[i]) });
      }
      if (iPositive[i] && voltage[i] > VpDerivative + 0.1 && voltage[i] < VpDerivative + 0.8) {
        saturation.push({ v: voltage[i], logI: Math.log(iPositive[i]) });
      }
    }
    
    if (retarding.length > 5 && saturation.length > 5) {
      const fit1 = linearFit(retarding.map(d => d.v), retarding.map(d => d.logI));
      const fit2 = linearFit(saturation.map(d => d.v), saturation.map(d => d.logI));
      VpNew = (fit2.c - fit1.c) / (fit1.m - fit2.m);
    } else {
      VpNew = VpDerivative;
    }
    
    console.log(`Iteration ${iterationCount}: Vp = ${VpNew.toFixed(4)} V`);
    
    // Step 3: 이온 전류 피팅
    const ionData = [];
    const ionVoltages = [];
    for (let i = 0; i < voltage.length; i++) {
      if (voltage[i] < -80) {
        ionData.push(current[i]);
        ionVoltages.push(voltage[i]);
      }
    }
    
    const clFit = fitCLModel(ionVoltages, ionData, VpNew);
    
    // Step 4: 전체 이온 전류 계산
    iIonFit = voltage.map(v => CLModel(v, VpNew, Te, clFit.iSat, clFit.a));
    
    // Step 5: 전자 전류 계산
    iCurrentToAnalyze = current.map((c, i) => c - iIonFit[i]);
    
    iterationHistory.push({
      iteration: iterationCount,
      Vp: VpNew,
      difference: Math.abs(VpNew - VpOld)
    });
    
    if (Math.abs(VpNew - VpOld) <= tolerance) {
      console.log('Converged!');
      break;
    }
  }
  
  // 최종 결과 계산
  const finalRetarding = [];
  for (let i = 0; i < voltage.length; i++) {
    if (voltage[i] <= VpNew && voltage[i] >= VpNew - 0.8 && iCurrentToAnalyze[i] > 0) {
      finalRetarding.push({ v: voltage[i], logI: Math.log(iCurrentToAnalyze[i]) });
    }
  }
  
  const finalFit = finalRetarding.length > 5 ? 
    linearFit(finalRetarding.map(d => d.v), finalRetarding.map(d => d.logI)) : 
    { m: 0.5, c: -10, mError: 0, cError: 0 };
  
  const Ip = Math.exp(finalFit.m * VpNew + finalFit.c);
  
  // 밀도 계산
  const ni = calculateIonDensity(clFit.iSat, Te);
  const ne = calculateElectronDensity(Ip, Te);
  
  // EEDF 계산
  const d2IdV2 = gradient(gradient(iCurrentToAnalyze, voltage), voltage);
  const eedfData = [];
  for (let i = 0; i < voltage.length; i++) {
    const energy = VpNew - voltage[i];
    if (energy >= 0 && energy < 20 && d2IdV2[i] > 0) {
      eedfData.push({ energy, value: d2IdV2[i] });
    }
  }
  
  return {
    Vp: VpNew,
    Te: Te,
    iSat: clFit.iSat,
    a: clFit.a,
    Ip: Ip,
    ni: ni,
    ne: ne,
    ratio: ni / ne,
    iIonFit: iIonFit,
    iElectronFit: iCurrentToAnalyze,
    eedfData: eedfData,
    dIdV: gradient(savgolFilter(current), voltage),
    iterationHistory: iterationHistory
  };
};