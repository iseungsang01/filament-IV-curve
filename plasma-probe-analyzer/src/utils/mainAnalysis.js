// ============================================
// src/utils/mainAnalysis.js
// 플라즈마 프로브 분석 알고리즘
// ============================================

const e = 1.602e-19;  // 전자 전하량 (C)
const kB = 1.381e-23; // 볼츠만 상수 (J/K)

/**
 * 전자 포화 전류 추정 (최대 전류)
 */
function estimateIes(voltage, current) {
  const maxIdx = current.indexOf(Math.max(...current));
  return current[maxIdx];
}

/**
 * 이온 포화 전류 추정 (가장 음의 전압에서의 전류)
 */
function estimateIsat(voltage, current) {
  const minIdx = voltage.indexOf(Math.min(...voltage));
  return Math.abs(current[minIdx]);
}

/**
 * 전자 온도 초기 추정 (선형 영역의 기울기)
 */
function estimateTe(voltage, current) {
  // 로그 스케일에서 선형 영역 찾기
  const logI = current.map(i => Math.log(Math.abs(i) + 1e-10));
  
  // 중간 영역에서 기울기 계산
  const mid = Math.floor(voltage.length / 2);
  const window = Math.floor(voltage.length / 4);
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  let count = 0;
  
  for (let i = mid - window; i < mid + window && i < voltage.length; i++) {
    if (i >= 0) {
      sumX += voltage[i];
      sumY += logI[i];
      sumXY += voltage[i] * logI[i];
      sumX2 += voltage[i] * voltage[i];
      count++;
    }
  }
  
  const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
  const Te = e / (slope * kB) / 11604.5; // Convert to eV
  
  return Math.abs(Te) > 0.1 && Math.abs(Te) < 100 ? Te : 2.0; // Default 2 eV
}

/**
 * 플라즈마 전위 추정 (1차 미분 최대점)
 */
function estimateVp(voltage, current) {
  const derivatives = [];
  
  for (let i = 1; i < current.length - 1; i++) {
    const dI = (current[i + 1] - current[i - 1]) / (voltage[i + 1] - voltage[i - 1]);
    derivatives.push({ voltage: voltage[i], derivative: dI });
  }
  
  const maxDerivIdx = derivatives.reduce((maxIdx, curr, idx, arr) => 
    curr.derivative > arr[maxIdx].derivative ? idx : maxIdx, 0
  );
  
  return derivatives[maxDerivIdx].voltage;
}

/**
 * 이론적 전류 계산
 */
function calculateTheoreticalCurrent(V, Vp, Te, Isat, Ies, params) {
  const { probeRadius, aCoefficient, magneticField } = params;
  
  if (V < Vp) {
    // 이온 포화 영역 + 전이 영역
    const expTerm = Math.exp((V - Vp) / Te);
    return -Isat + (Ies + Isat) * expTerm;
  } else {
    // 전자 포화 영역
    const sheathExpansion = 1 + aCoefficient * (V - Vp);
    return Ies * sheathExpansion;
  }
}

/**
 * 단일 파일 분석
 */
export async function analyzeSingleFile(fileData, params, onProgress) {
  try {
    const { voltage, current, filename, position } = fileData;
    const { probeRadius, ionMass, magneticField, maxIterations, tolerance } = params;
    
    // 초기 추정
    let Isat = estimateIsat(voltage, current);
    let Ies = estimateIes(voltage, current);
    let Te = estimateTe(voltage, current);
    let Vp = estimateVp(voltage, current);
    
    // 반복 최적화
    let converged = false;
    let iteration = 0;
    let prevVp = Vp;
    
    for (iteration = 0; iteration < maxIterations; iteration++) {
      if (onProgress) {
        onProgress(iteration);
      }
      
      // 이론적 전류 계산
      const theoreticalCurrent = voltage.map(v => 
        calculateTheoreticalCurrent(v, Vp, Te, Isat, Ies, params)
      );
      
      // 잔차 계산
      const residuals = current.map((I, i) => I - theoreticalCurrent[i]);
      const rms = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length);
      
      // Vp 업데이트 (경사 하강법)
      const dVp = 0.01 * Te;
      const gradientVp = residuals.reduce((sum, r, i) => {
        const dI_dVp = (calculateTheoreticalCurrent(voltage[i], Vp + dVp, Te, Isat, Ies, params) -
                        calculateTheoreticalCurrent(voltage[i], Vp, Te, Isat, Ies, params)) / dVp;
        return sum + r * dI_dVp;
      }, 0);
      
      Vp = Vp + 0.001 * gradientVp;
      
      // 수렴 확인
      if (Math.abs(Vp - prevVp) < tolerance) {
        converged = true;
        break;
      }
      
      prevVp = Vp;
      
      // 작은 지연 (UI 업데이트용)
      if (iteration % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // 밀도 계산
    const Ap = 2 * Math.PI * probeRadius * 0.01; // 프로브 면적 (m²), 1cm 길이 가정
    const cs = Math.sqrt((e * Te * 11604.5 * kB) / ionMass); // 이온 음속
    const ni = Isat / (0.61 * e * Ap * cs);
    const ne = (Ies / (0.25 * e * Ap * Math.sqrt(8 * e * Te * 11604.5 * kB / (Math.PI * 9.109e-31))));
    
    // 오차 추정 (간단한 통계적 방법)
    const TeErr = Te * 0.1;  // 10% 오차 가정
    const VpErr = Te * 0.05;  // 5% 오차
    const niErr = ni * 0.15;
    const neErr = ne * 0.15;
    const ratioErr = Math.abs(ne / ni) * Math.sqrt(Math.pow(neErr / ne, 2) + Math.pow(niErr / ni, 2));
    
    return {
      filename,
      position,
      Vp,
      VpErr,
      Te,
      TeErr,
      Isat,
      Ies,
      ni,
      niErr,
      ne,
      neErr,
      ratio: ne / ni,
      ratioErr,
      converged,
      iterations: iteration + 1,
      error: null
    };
    
  } catch (error) {
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
      ni: 0,
      niErr: 0,
      ne: 0,
      neErr: 0,
      ratio: 0,
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
    r.ni.toExponential(4),
    r.niErr.toExponential(4),
    r.ne.toExponential(4),
    r.neErr.toExponential(4),
    r.ratio.toFixed(6),
    r.ratioErr.toFixed(6),
    r.converged ? 'Yes' : 'No',
    r.iterations,
    r.error || ''
  ]);
  
  const csv = [headers.join(',')].concat(rows.map(row => row.join(','))).join('\n');
  return csv;
}