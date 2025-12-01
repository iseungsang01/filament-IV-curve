// 물리 상수
export const CONSTANTS = {
  e: 1.60217663e-19,      // 전자 전하 (C)
  mAr: 6.6335209e-26,     // Ar 질량 (kg)
  me: 9.10938356e-31,     // 전자 질량 (kg)
  A: Math.PI * Math.pow(0.003, 2)  // 프로브 면적 (m²)
};

// 이온 밀도 계산
export const calculateIonDensity = (iSat, T) => {
  const { e, mAr, A } = CONSTANTS;
  const cs = Math.sqrt(T * e / mAr);
  return -iSat / (e * cs * 0.6 * A);
};

// 전자 밀도 계산
export const calculateElectronDensity = (Ip, T) => {
  const { e, me, A } = CONSTANTS;
  const vth = Math.sqrt(8 * e * T / (Math.PI * me));
  return Ip / (0.25 * e * vth * A);
};

// CL 모델
export const CLModel = (V, Vp, T, iSat, a) => {
  const base = Math.abs((Vp - V) / T);
  const sheathTerm = base > 0 ? a * Math.pow(base, 0.75) : 0;
  return iSat * (1 + sheathTerm);
};

// EEDF 계산을 위한 2차 미분
export const calculateEEDF = (voltage, current) => {
  const { gradient } = require('./dataProcessing');
  
  const dIdV = gradient(current, voltage);
  const d2IdV2 = gradient(dIdV, voltage);
  
  return d2IdV2;
};