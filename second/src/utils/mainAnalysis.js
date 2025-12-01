// ============================================
// src/utils/mainAnalysis.js
// 플라즈마 프로브 분석 알고리즘 (개선 버전)
// ============================================

const e = 1.602e-19;  // 전자 전하량 (C)
const kB = 1.381e-23; // 볼츠만 상수 (J/K)
const me = 9.109e-31; // 전자 질량 (kg)

/**
 * 데이터 정렬 및 전처리
 */
function preprocessData(voltage, current) {
  // voltage-current 쌍을 만들고 전압 기준으로 정렬
  const pairs = voltage.map((v, i) => ({ v, i: current[i] }))
    .sort((a, b) => a.v - b.v);
  
  return {
    voltage: pairs.map(p => p.v),
    current: pairs.map(p => p.i)
  };
}

/**
 * 이온 포화 전류 추정 (가장 음의 전압 영역의 평균)
 */
function estimateIsat(voltage, current) {
  // 가장 낮은 전압 20% 구간의 평균 전류 (절댓값)
  const sortedPairs = voltage.map((v, i) => ({ v, i: current[i] }))
    .sort((a, b) => a.v - b.v);
  
  const lowVoltageCount = Math.floor(sortedPairs.length * 0.2);
  const lowVoltageCurrents = sortedPairs.slice(0, lowVoltageCount).map(p => Math.abs(p.i));
  
  const avgIsat = lowVoltageCurrents.reduce((sum, i) => sum + i, 0) / lowVoltageCurrents.length;
  
  return avgIsat > 0 ? avgIsat : 1e-6; // 최소값 보장
}

/**
 * 전자 포화 전류 추정 (가장 양의 전압 영역)
 */
function estimateIes(voltage, current) {
  // 가장 높은 전압 20% 구간의 평균 전류
  const sortedPairs = voltage.map((v, i) => ({ v, i: current[i] }))
    .sort((a, b) => a.v - b.v);
  
  const highVoltageCount = Math.floor(sortedPairs.length * 0.2);
  const highVoltageCurrents = sortedPairs.slice(-highVoltageCount).map(p => p.i);
  
  const avgIes = highVoltageCurrents.reduce((sum, i) => sum + i, 0) / highVoltageCurrents.length;
  
  return avgIes > 0 ? avgIes : 1e-6; // 최소값 보장
}

/**
 * 플라즈마 전위 추정 (1차 미분 최대점)
 */
function estimateVp(voltage, current) {
  const derivatives = [];
  
  // 중앙 차분법으로 1차 미분 계산
  for (let i = 2; i < current.length - 2; i++) {
    const dI = (current[i + 2] - current[i - 2]) / (voltage[i + 2] - voltage[i - 2]);
    derivatives.push({ voltage: voltage[i], derivative: dI });
  }
  
  if (derivatives.length === 0) return 0;
  
  // 최대 기울기를 가진 점 찾기
  const maxDerivIdx = derivatives.reduce((maxIdx, curr, idx, arr) => 
    Math.abs(curr.derivative) > Math.abs(arr[maxIdx].derivative) ? idx : maxIdx, 0
  );
  
  return derivatives[maxDerivIdx].voltage;
}

/**
 * 전자 온도 추정 (향상된 방법)
 * Vp 근처의 전이 영역에서 ln(I) vs V의 기울기 사용
 */
function estimateTe(voltage, current, Vp) {
  // Vp 근처 ±5V 영역 선택
  const transitionPoints = voltage
    .map((v, i) => ({ v, i: current[i], idx: i }))
    .filter(p => p.v > Vp - 5 && p.v < Vp + 2 && p.i > 0);
  
  if (transitionPoints.length < 5) {
    return 2.0; // 기본값
  }
  
  // ln(I) vs V 선형 회귀
  const n = transitionPoints.length;
  let sumV = 0, sumLnI = 0, sumVLnI = 0, sumV2 = 0;
  
  transitionPoints.forEach(p => {
    const lnI = Math.log(p.i);
    sumV += p.v;
    sumLnI += lnI;
    sumVLnI += p.v * lnI;
    sumV2 += p.v * p.v;
  });
  
  const slope = (n * sumVLnI - sumV * sumLnI) / (n * sumV2 - sumV * sumV);
  
  // Te = e / (slope * kB) 를 eV로 변환
  const Te_eV = 1 / slope; // slope = e/(kB*Te) 이므로
  
  // 물리적으로 합리적인 범위로 제한 (0.5 ~ 20 eV)
  if (Te_eV > 0.5 && Te_eV < 20) {
    return Te_eV;
  }
  
  return 2.0; // 기본값
}

/**
 * 단일 파일 분석 (개선된 알고리즘)
 */
export async function analyzeSingleFile(fileData, params, onProgress) {
  try {
    let { voltage, current } = fileData;
    const { filename, position } = fileData;
    const { probeRadius, ionMass, magneticField, maxIterations, tolerance } = params;
    
    // 데이터 전처리
    const processed = preprocessData(voltage, current);
    voltage = processed.voltage;
    current = processed.current;
    
    // 1단계: 초기 파라미터 추정
    let Vp = estimateVp(voltage, current);
    let Te = estimateTe(voltage, current, Vp);
    let Isat = estimateIsat(voltage, current);
    let Ies = estimateIes(voltage, current);
    
    console.log(`Initial estimates for ${filename}:`, {
      Vp: Vp.toFixed(3),
      Te: Te.toFixed(3),
      Isat: (Isat * 1000).toFixed(3) + ' mA',
      Ies: (Ies * 1000).toFixed(3) + ' mA'
    });
    
    // 2단계: Vp 정밀화 (반복 최적화)
    let converged = false;
    let iteration = 0;
    let prevVp = Vp;
    const learningRate = 0.1; // 학습률
    
    for (iteration = 0; iteration < maxIterations; iteration++) {
      if (onProgress && iteration % 5 === 0) {
        onProgress(iteration);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      // Vp 근처 데이터로 Te 재추정
      Te = estimateTe(voltage, current, Vp);
      
      // Vp에서의 전류 찾기 (보간)
      let IatVp = 0;
      for (let i = 0; i < voltage.length - 1; i++) {
        if (voltage[i] <= Vp && voltage[i + 1] >= Vp) {
          const t = (Vp - voltage[i]) / (voltage[i + 1] - voltage[i]);
          IatVp = current[i] + t * (current[i + 1] - current[i]);
          break;
        }
      }
      
      // Vp 업데이트: 전자 포화 전류 근처에서 미분이 0이 되는 점 찾기
      let gradient = 0;
      const deltaV = 0.1;
      
      // Vp 주변에서 기울기 계산
      for (let i = 1; i < voltage.length - 1; i++) {
        if (Math.abs(voltage[i] - Vp) < deltaV * 5) {
          const localGrad = (current[i + 1] - current[i - 1]) / (voltage[i + 1] - voltage[i - 1]);
          gradient += localGrad * (voltage[i] - Vp);
        }
      }
      
      // Vp 업데이트
      const vpUpdate = learningRate * gradient;
      Vp = Vp - vpUpdate;
      
      // 수렴 확인
      if (Math.abs(Vp - prevVp) < tolerance) {
        converged = true;
        break;
      }
      
      prevVp = Vp;
    }
    
    // 3단계: 최종 파라미터 계산
    Te = estimateTe(voltage, current, Vp);
    
    // 프로브 표면적 (원통형 프로브, 길이 1cm 가정)
    const probeLength = 0.01; // 1 cm
    const Ap = 2 * Math.PI * probeRadius * probeLength;
    
    // 이온 음속
    const Te_Kelvin = Te * 11604.5; // eV to Kelvin
    const cs = Math.sqrt((kB * Te_Kelvin) / ionMass);
    
    // 이온 밀도
    const ni = Isat / (0.61 * e * Ap * cs);
    
    // 전자 열속도
    const vth_e = Math.sqrt((8 * kB * Te_Kelvin) / (Math.PI * me));
    
    // 전자 밀도
    const ne = Ies / (0.25 * e * Ap * vth_e);
    
    // 물리적으로 타당한 범위 체크
    const isValidNi = ni > 1e14 && ni < 1e20 && !isNaN(ni) && isFinite(ni);
    const isValidNe = ne > 1e14 && ne < 1e20 && !isNaN(ne) && isFinite(ne);
    
    // 오차 추정
    const TeErr = Te * 0.15;  // 15% 오차
    const VpErr = Te * 0.08;  // 8% 오차
    const niErr = isValidNi ? ni * 0.2 : 0;  // 20% 오차
    const neErr = isValidNe ? ne * 0.2 : 0;  // 20% 오차
    
    const ratio = (isValidNe && isValidNi) ? ne / ni : NaN;
    const ratioErr = (isValidNe && isValidNi) ? 
      Math.abs(ratio) * Math.sqrt(Math.pow(neErr / ne, 2) + Math.pow(niErr / ni, 2)) : NaN;
    
    console.log(`Final results for ${filename}:`, {
      Vp: Vp.toFixed(3) + ' V',
      Te: Te.toFixed(3) + ' eV',
      ni: isValidNi ? ni.toExponential(2) : 'NaN',
      ne: isValidNe ? ne.toExponential(2) : 'NaN',
      ratio: !isNaN(ratio) ? ratio.toFixed(3) : 'NaN',
      iterations: iteration + 1,
      converged
    });
    
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
    
    // 파일 간 작은 지연
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