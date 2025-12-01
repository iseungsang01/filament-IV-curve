// 유틸리티 헬퍼 함수들

/**
 * 과학적 표기법 포맷팅
 */
export const formatScientific = (num, decimals = 2) => {
  if (num === 0) return '0';
  return num.toExponential(decimals);
};

/**
 * 숫자를 읽기 좋은 형식으로 포맷팅
 */
export const formatNumber = (num, decimals = 2) => {
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.01 && num !== 0)) {
    return formatScientific(num, decimals);
  }
  return num.toFixed(decimals);
};

/**
 * 백분율 포맷팅
 */
export const formatPercent = (value, decimals = 1) => {
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * 시간 포맷팅 (초를 읽기 좋은 단위로)
 */
export const formatTime = (seconds) => {
  if (seconds < 1e-12) return `${(seconds * 1e15).toFixed(2)} fs`;
  if (seconds < 1e-9) return `${(seconds * 1e12).toFixed(2)} ps`;
  if (seconds < 1e-6) return `${(seconds * 1e9).toFixed(2)} ns`;
  if (seconds < 1e-3) return `${(seconds * 1e6).toFixed(2)} μs`;
  if (seconds < 1) return `${(seconds * 1e3).toFixed(2)} ms`;
  return `${seconds.toFixed(2)} s`;
};

/**
 * 에너지 포맷팅
 */
export const formatEnergy = (eV, decimals = 2) => {
  return `${eV.toFixed(decimals)} eV`;
};

/**
 * 거리 포맷팅
 */
export const formatDistance = (meters) => {
  if (meters < 1e-9) return `${(meters * 1e12).toFixed(2)} pm`;
  if (meters < 1e-6) return `${(meters * 1e9).toFixed(2)} nm`;
  if (meters < 1e-3) return `${(meters * 1e6).toFixed(2)} μm`;
  if (meters < 1) return `${(meters * 1e3).toFixed(2)} mm`;
  return `${meters.toFixed(2)} m`;
};

/**
 * 배열의 통계 계산
 */
export const calculateStatistics = (array) => {
  if (!array || array.length === 0) {
    return {
      mean: 0,
      median: 0,
      std: 0,
      min: 0,
      max: 0
    };
  }
  
  const sorted = [...array].sort((a, b) => a - b);
  const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
  
  const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
  const std = Math.sqrt(variance);
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return {
    mean,
    median,
    std,
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
};

/**
 * 히스토그램 생성
 */
export const createHistogram = (data, numBins = 10) => {
  if (!data || data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  
  const bins = new Array(numBins).fill(0);
  
  data.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      numBins - 1
    );
    bins[binIndex]++;
  });
  
  return bins.map((count, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count
  }));
};

/**
 * 배열을 특정 크기의 청크로 분할
 */
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * 딥 클론
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 랜덤 UUID 생성
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 파일 다운로드
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * JSON 다운로드
 */
export const downloadJSON = (data, filename = 'data.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename, 'application/json');
};

/**
 * CSV 다운로드
 */
export const downloadCSV = (data, filename = 'data.csv') => {
  downloadFile(data, filename, 'text/csv');
};

/**
 * 디바운스 함수
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 스로틀 함수
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 선형 스케일 변환
 */
export const linearScale = (value, fromMin, fromMax, toMin, toMax) => {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
};

/**
 * 로그 스케일 변환
 */
export const logScale = (value, fromMin, fromMax, toMin, toMax) => {
  const logMin = Math.log10(fromMin);
  const logMax = Math.log10(fromMax);
  const logValue = Math.log10(value);
  const normalized = (logValue - logMin) / (logMax - logMin);
  return toMin + normalized * (toMax - toMin);
};