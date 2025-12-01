// ============================================
// src/utils/mainAnalysis.js
// 개선된 플라즈마 프로브 분석 알고리즘
// Python 방식의 정밀 추정 + 물리적 타당성 강화
// ============================================

const e = 1.602e-19;  // 전자 전하량 (C)
const kB = 1.381e-23; // 볼츠만 상수 (J/K)
const me = 9.109e-31; // 전자 질량 (kg)

/**
 * Child-Langmuir 모델 (이온 전류)
 * 음의 전압 영역에서 sheath expansion 효과 포함
 */
function childLangmuirModel(V, Vp, Te, Isat) {
  const a = 1.02; // Sheath expansion coefficient (표준값)
  const base = (Vp - V) / Te;
  
  if (base <= 0) return Isat;
  
  const sheathTerm = a * Math.pow(base, 0.75);
  return Isat * (1 + sheathTerm);
}

/**
 * 선형 회귀 (최소제곱법) + 오차 추정
 */
function linearRegression(x, y) {
  const n = x.length;
  if (n < 3) return { slope: 0, intercept: 0, slopeErr: 0, interceptErr: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 잔차 분산 계산
  let sumResiduals2 = 0;
  for (let i = 0; i < n; i++) {
    const residual = y[i] - (slope * x[i] + intercept);
    sumResiduals2 += residual * residual;
  }
  
  const variance = sumResiduals2 / Math.max(1, n - 2);
  const slopeErr = Math.sqrt(variance * n / (n * sumX2 - sumX * sumX));
  const interceptErr = Math.sqrt(variance * sumX2 / (n * sumX2 - sumX * sumX));
  
  return { slope, intercept, slopeErr, interceptErr };
}

/**
 * 데이터 정렬 및 전처리
 */
function preprocessData(voltage, current) {
  const pairs = voltage.map((v, i) => ({ v, i: current[i] }))
    .filter(p => !isNaN(p.v) && !isNaN(p.i) && isFinite(p.v) && isFinite(p.i))
    .sort((a, b) => a.v - b.v);
  
  return {
    voltage: pairs.map(p => p.v),
    current: pairs.map(p => p.i)
  };
}

/**
 * 이온 포화 전류 추정
 */
function estimateIsat(voltage, current) {
  const lowVoltageCount = Math.max(5, Math.floor(voltage.length * 0.2));
  const lowVoltageCurrents = current.slice(0, lowVoltageCount).map(i => Math.abs(i));
  
  const avgIsat = lowVoltageCurrents.reduce((sum, i) => sum + i, 0) / lowVoltageCurrents.length;
  return avgIsat > 0 ? avgIsat : 1e-6;
}

/**
 * 전자 포화 전류 추정
 */
function estimateIes(voltage, current) {
  const highVoltageCount = Math.max(5, Math.floor(voltage.length * 0.2));
  const highVoltageCurrents = current.slice(-highVoltageCount);
  
  const avgIes = highVoltageCurrents.reduce((sum, i) => sum + i, 0) / highVoltageCurrents.length;
  return avgIes > 0 ? avgIes : 1e-6;
}

/**
 * 초기 플라즈마 전위 추정 (1차 미분 최대점)
 */
function estimateVpInitial(voltage, current) {
  const derivatives = [];
  
  for (let i = 2; i < current.length - 2; i++) {
    const dI = (current[i + 2] - current[i - 2]) / (voltage[i + 2] - voltage[i - 2]);
    derivatives.push({ voltage: voltage[i], derivative: Math.abs(dI) });
  }
  
  if (derivatives.length === 0) return 0;
  
  const maxDerivIdx = derivatives.reduce((maxIdx, curr, idx, arr) => 
    curr.derivative > arr[maxIdx].derivative ? idx : maxIdx, 0
  );
  
  return derivatives[maxDerivIdx].voltage;
}

/**
 * **핵심 개선**: 정밀한 Vp/Te 추정
 * Python 방식: Transition & Saturation 영역의 직선 교점
 */
function estimateVpAndTePrecise(voltage, current, VpGuess, Isat) {
  const Te_initial = 2.0;
  
  // 1. 이온 전류 모델 계산
  const ionCurrent = voltage.map(v => 
    childLangmuirModel(v, VpGuess, Te_initial, Isat)
  );
  
  // 2. 전자 전류 분리
  const electronCurrent = current.map((i, idx) => i - ionCurrent[idx]);
  
  // 3. log(Ie) 계산 (양수만)
  const logElectronCurrent = electronCurrent.map(i => 
    i > 1e-7 ? Math.log(i) : NaN
  );
  
  // 4. Transition 영역: Vp-2V ~ Vp
  const transitionIndices = [];
  for (let i = 0; i < voltage.length; i++) {
    if (voltage[i] < VpGuess && voltage[i] > VpGuess - 2.0 && !isNaN(logElectronCurrent[i])) {
      transitionIndices.push(i);
    }
  }
  
  const vTrans = transitionIndices.map(i => voltage[i]);
  const logITrans = transitionIndices.map(i => logElectronCurrent[i]);
  
  // 5. Saturation 영역: Vp+0.5V ~ Vp+5V
  const saturationIndices = [];
  for (let i = 0; i < voltage.length; i++) {
    if (voltage[i] > VpGuess + 0.5 && voltage[i] < VpGuess + 5.0 && !isNaN(logElectronCurrent[i])) {
      saturationIndices.push(i);
    }
  }
  
  const vSat = saturationIndices.map(i => voltage[i]);
  const logISat = saturationIndices.map(i => logElectronCurrent[i]);
  
  // 6. 데이터 부족 시 기본값 반환
  if (vTrans.length < 3 || vSat.length < 3) {
    return { 
      Vp: VpGuess, 
      Te: 2.0, 
      Ies: 1e-3, 
      VpErr: 0.2, 
      TeErr: 0.3, 
      IesErr: 1e-4 
    };
  }
  
  // 7. 각 영역 선형 회귀
  const fit1 = linearRegression(vTrans, logITrans); // Transition
  const fit2 = linearRegression(vSat, logISat);     // Saturation
  
  // 8. 두 직선의 교점 = Vp
  const slopeDiff = fit1.slope - fit2.slope;
  if (Math.abs(slopeDiff) < 1e-4) {
    return { 
      Vp: VpGuess, 
      Te: 2.0, 
      Ies: 1e-3, 
      VpErr: 0.2, 
      TeErr: 0.3, 
      IesErr: 1e-4 
    };
  }
  
  const Vp_new = (fit2.intercept - fit1.intercept) / slopeDiff;
  
  // 9. Te = 1 / slope (transition 영역)
  const Te_new = Math.abs(1.0 / fit1.slope);
  
  // 10. Ies = exp(m1*Vp + c1)
  const Ies_new = Math.exp(fit1.slope * Vp_new + fit1.intercept);
  
  // 11. 오차 전파
  const VpErr = Math.sqrt(
    Math.pow(fit1.interceptErr / slopeDiff, 2) + 
    Math.pow(fit2.interceptErr / slopeDiff, 2)
  );
  
  const TeErr = Te_new * Math.abs(fit1.slopeErr / fit1.slope);
  
  const IesErr = Ies_new * Math.sqrt(
    Math.pow(Vp_new * fit1.slopeErr, 2) + 
    Math.pow(fit1.interceptErr, 2)
  );
  
  // 12. 물리적 범위 체크
  const Te_final = (Te_new > 0.5 && Te_new < 20) ? Te_new : 2.0;
  
  return {
    Vp: Vp_new,
    Te: Te_final,
    Ies: Ies_new,
    VpErr: Math.max(VpErr, 0.1),
    TeErr: Math.max(TeErr, 0.1),
    IesErr: Math.max(IesErr, Ies_new * 0.1)
  };
}

/**
 * 단일 파일 분석 (개선 버전)
 */
export async function analyzeSingleFile(fileData, params, onProgress) {
  try {
    let { voltage, current } = fileData;
    const { filename, position } = fileData;
    const { probeRadius, ionMass, maxIterations, tolerance } = params;
    
    // 전처리
    const processed = preprocessData(voltage, current);
    voltage = processed.voltage;
    current = processed.current;
    
    // 1단계: 초기 파라미터 추정
    let Isat = estimateIsat(voltage, current);
    let Ies = estimateIes(voltage, current);
    let Vp = estimateVpInitial(voltage, current);
    let Te = 2.0;
    
    console.log(`[${filename}] Initial: Vp=${Vp.toFixed(2)}V, Isat=${(Isat*1000).toFixed(2)}mA`);
    
    // 2단계: 반복 최적화
    let converged = false;
    let iteration = 0;
    let prevVp = Vp;
    
    for (iteration = 0; iteration < maxIterations; iteration++) {
      if (onProgress && iteration % 5 === 0) {
        onProgress(iteration);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      // 정밀 추정 (Python 방식)
      const result = estimateVpAndTePrecise(voltage, current, Vp, Isat);
      
      // Damping factor로 부드러운 수렴
      Vp = 0.6 * Vp + 0.4 * result.Vp;
      Te = 0.6 * Te + 0.4 * result.Te;
      Ies = result.Ies;
      
      // 수렴 확인
      if (Math.abs(Vp - prevVp) < tolerance) {
        converged = true;
        break;
      }
      
      prevVp = Vp;
    }
    
    // 최종 정밀 추정
    const finalResult = estimateVpAndTePrecise(voltage, current, Vp, Isat);
    Vp = finalResult.Vp;
    Te = finalResult.Te;
    Ies = finalResult.Ies;
    
    const VpErr = finalResult.VpErr;
    const TeErr = finalResult.TeErr;
    const IesErr = finalResult.IesErr;
    
    // 3단계: 밀도 계산
    const probeLength = 0.01; // 1 cm
    const Ap = 2 * Math.PI * probeRadius * probeLength;
    
    const Te_Kelvin = Te * 11604.5;
    const cs = Math.sqrt((kB * Te_Kelvin) / ionMass);
    
    // 이온 밀도 (계수 0.61로 수정)
    const ni = Isat / (0.61 * e * Ap * cs);
    
    const vth_e = Math.sqrt((8 * kB * Te_Kelvin) / (Math.PI * me));
    
    // 전자 밀도
    const ne = Ies / (0.25 * e * Ap * vth_e);
    
    // 물리적 타당성 체크
    const isValidNi = ni > 1e14 && ni < 1e20 && !isNaN(ni) && isFinite(ni);
    const isValidNe = ne > 1e14 && ne < 1e20 && !isNaN(ne) && isFinite(ne);
    
    // 오차 계산
    const IsatErr = Isat * 0.15;
    const niErr = isValidNi ? ni * Math.sqrt(
      Math.pow(IsatErr / Isat, 2) + 
      Math.pow(0.5 * TeErr / Te, 2)
    ) : 0;
    
    const neErr = isValidNe ? ne * Math.sqrt(
      Math.pow(IesErr / Ies, 2) + 
      Math.pow(0.5 * TeErr / Te, 2)
    ) : 0;
    
    const ratio = (isValidNe && isValidNi) ? ne / ni : NaN;
    const ratioErr = (isValidNe && isValidNi) ? 
      Math.abs(ratio) * Math.sqrt(Math.pow(neErr / ne, 2) + Math.pow(niErr / ni, 2)) : NaN;
    
    console.log(`[${filename}] Final: Vp=${Vp.toFixed(2)}V, Te=${Te.toFixed(2)}eV, ratio=${ratio.toFixed(3)}, iter=${iteration + 1}`);
    
    return {
      filename,
      position,
      Vp,
      VpErr,
      Te: Math.abs(Te),
      TeErr,
      Isat,
      Ies,
      ni: isValidNi ? ni : NaN,
      niErr,
      ne: isValidNe ? ne : NaN,
      neErr,
      ratio,
      ratioErr,
      converged,
      iterations: iteration + 1,
      error: null
    };
    
  } catch (error) {
    console.error(`Error analyzing ${fileData.filename}:`, error);
    return {
      filename: fileData.filename,
      position: fileData.position,
      error: error.message,
      Vp: 0,
      VpErr: 0,
      Te: 0,
      TeErr: 0,
      Isat: 0,
      Ies: 0,
      ni: NaN,
      niErr: 0,
      ne: NaN,
      neErr: 0,
      ratio: NaN,
      ratioErr: 0,
      converged: false,
      iterations: 0
    };
  }
}

/**
 * 여러 파일 분석
 */
export async function analyzeMultipleFiles(filesData, params, onFileProgress) {
  const results = [];
  
  for (let i = 0; i < filesData.length; i++) {
    const fileData = filesData[i];
    
    if (onFileProgress) {
      onFileProgress(i, filesData.length, fileData.filename);
    }
    
    const result = await analyzeSingleFile(fileData, params, null);
    results.push(result);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * 결과를 CSV로 변환
 */
export function resultsToCSV(results) {
  const headers = [
    'Filename',
    'Position(cm)',
    'Vp(V)',
    'VpErr(V)',
    'Te(eV)',
    'TeErr(eV)',
    'Isat(A)',
    'Ies(A)',
    'ni(m-3)',
    'niErr(m-3)',
    'ne(m-3)',
    'neErr(m-3)',
    'ne/ni',
    'Ratio_Err',
    'Converged',
    'Iterations',
    'Error'
  ];
  
  const rows = results.map(r => [
    r.filename,
    r.position !== null ? r.position.toFixed(2) : 'N/A',
    r.Vp.toFixed(4),
    r.VpErr.toFixed(4),
    r.Te.toFixed(4),
    r.TeErr.toFixed(4),
    r.Isat.toExponential(4),
    r.Ies.toExponential(4),
    !isNaN(r.ni) ? r.ni.toExponential(4) : 'NaN',
    !isNaN(r.niErr) ? r.niErr.toExponential(4) : 'NaN',
    !isNaN(r.ne) ? r.ne.toExponential(4) : 'NaN',
    !isNaN(r.neErr) ? r.neErr.toExponential(4) : 'NaN',
    !isNaN(r.ratio) ? r.ratio.toFixed(6) : 'NaN',
    !isNaN(r.ratioErr) ? r.ratioErr.toFixed(6) : 'NaN',
    r.converged ? 'Yes' : 'No',
    r.iterations,
    r.error || ''
  ]);
  
  const csv = [headers.join(',')].concat(rows.map(row => row.join(','))).join('\n');
  return csv;
}