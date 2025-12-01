/**
 * Helper Utilities
 * 데이터 처리, 포맷팅, 분석 등을 위한 유틸리티 함수들
 */

/**
 * 숫자를 공학 표기법으로 포맷
 * @param {number} num - 숫자
 * @param {number} digits - 유효 자릿수
 * @returns {string} 포맷된 문자열
 */
export function formatScientific(num, digits = 2) {
  if (num === 0) return '0';
  if (num === Infinity) return '∞';
  if (num === -Infinity) return '-∞';
  if (isNaN(num)) return 'NaN';
  
  return num.toExponential(digits);
}

/**
 * 숫자를 적절한 단위로 포맷 (SI prefix)
 * @param {number} num - 숫자
 * @param {string} unit - 기본 단위
 * @param {number} precision - 소수점 자릿수
 * @returns {string} 포맷된 문자열
 */
export function formatWithUnit(num, unit = '', precision = 2) {
  if (num === 0) return `0 ${unit}`;
  
  const prefixes = [
    { value: 1e24, prefix: 'Y' },
    { value: 1e21, prefix: 'Z' },
    { value: 1e18, prefix: 'E' },
    { value: 1e15, prefix: 'P' },
    { value: 1e12, prefix: 'T' },
    { value: 1e9, prefix: 'G' },
    { value: 1e6, prefix: 'M' },
    { value: 1e3, prefix: 'k' },
    { value: 1, prefix: '' },
    { value: 1e-3, prefix: 'm' },
    { value: 1e-6, prefix: 'μ' },
    { value: 1e-9, prefix: 'n' },
    { value: 1e-12, prefix: 'p' },
    { value: 1e-15, prefix: 'f' },
    { value: 1e-18, prefix: 'a' }
  ];
  
  for (const { value, prefix } of prefixes) {
    if (Math.abs(num) >= value) {
      return `${(num / value).toFixed(precision)} ${prefix}${unit}`;
    }
  }
  
  return `${num.toFixed(precision)} ${unit}`;
}

/**
 * 히스토그램 데이터 생성
 * @param {Array<number>} data - 데이터 배열
 * @param {number} numBins - 빈 개수
 * @returns {Array} 히스토그램 데이터
 */
export function createHistogram(data, numBins = 20) {
  if (data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  
  const bins = Array(numBins).fill(0);
  const binEdges = Array(numBins + 1).fill(0).map((_, i) => min + i * binWidth);
  
  data.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      numBins - 1
    );
    bins[binIndex]++;
  });
  
  return bins.map((count, i) => ({
    binStart: binEdges[i],
    binEnd: binEdges[i + 1],
    binCenter: (binEdges[i] + binEdges[i + 1]) / 2,
    count: count,
    frequency: count / data.length
  }));
}

/**
 * 통계 계산
 * @param {Array<number>} data - 데이터 배열
 * @returns {Object} 통계 정보
 */
export function calculateStats(data) {
  if (data.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      std: 0,
      min: 0,
      max: 0,
      q25: 0,
      q75: 0
    };
  }
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  
  // 평균
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  
  // 표준편차
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  
  // 중앙값
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  // 사분위수
  const q25 = sorted[Math.floor(n * 0.25)];
  const q75 = sorted[Math.floor(n * 0.75)];
  
  return {
    count: n,
    mean,
    median,
    std,
    min: sorted[0],
    max: sorted[n - 1],
    q25,
    q75,
    iqr: q75 - q25
  };
}

/**
 * 누적 분포 함수 (CDF) 계산
 * @param {Array<number>} data - 데이터 배열
 * @returns {Array} CDF 데이터
 */
export function calculateCDF(data) {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  return sorted.map((value, index) => ({
    value,
    cdf: (index + 1) / n
  }));
}

/**
 * 이동 평균 계산
 * @param {Array<number>} data - 데이터 배열
 * @param {number} windowSize - 윈도우 크기
 * @returns {Array<number>} 이동 평균
 */
export function movingAverage(data, windowSize = 3) {
  if (data.length < windowSize) return data;
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  
  return result;
}

/**
 * 데이터를 CSV 문자열로 변환
 * @param {Array<Object>} data - 데이터 배열
 * @param {Array<string>} headers - 헤더 배열
 * @returns {string} CSV 문자열
 */
export function arrayToCSV(data, headers) {
  const csvRows = [];
  
  // 헤더 추가
  csvRows.push(headers.join(','));
  
  // 데이터 행 추가
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // 숫자는 그대로, 문자열은 따옴표로 감싸기
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * CSV 다운로드
 * @param {string} csvContent - CSV 내용
 * @param {string} filename - 파일명
 */
export function downloadCSV(csvContent, filename = 'data.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * JSON 다운로드
 * @param {Object} data - JSON 데이터
 * @param {string} filename - 파일명
 */
export function downloadJSON(data, filename = 'data.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 배열을 지정된 크기의 청크로 분할
 * @param {Array} array - 배열
 * @param {number} chunkSize - 청크 크기
 * @returns {Array<Array>} 청크 배열
 */
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 선형 보간
 * @param {number} x - 보간할 x 값
 * @param {number} x0 - x0
 * @param {number} x1 - x1
 * @param {number} y0 - y0
 * @param {number} y1 - y1
 * @returns {number} 보간된 y 값
 */
export function linearInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
}

/**
 * 로그 스케일 보간
 * @param {number} x - 보간할 x 값
 * @param {number} x0 - x0
 * @param {number} x1 - x1
 * @param {number} y0 - y0
 * @param {number} y1 - y1
 * @returns {number} 보간된 y 값
 */
export function logInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0 || y0 <= 0 || y1 <= 0) return y0;
  
  const logY0 = Math.log(y0);
  const logY1 = Math.log(y1);
  const logY = linearInterpolate(x, x0, x1, logY0, logY1);
  
  return Math.exp(logY);
}

/**
 * 배열에서 특정 값에 가장 가까운 인덱스 찾기
 * @param {Array<number>} array - 배열
 * @param {number} target - 목표 값
 * @returns {number} 인덱스
 */
export function findNearestIndex(array, target) {
  let minDiff = Infinity;
  let closestIndex = 0;
  
  array.forEach((value, index) => {
    const diff = Math.abs(value - target);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = index;
    }
  });
  
  return closestIndex;
}

/**
 * 시간 포맷팅
 * @param {number} seconds - 초
 * @returns {string} 포맷된 시간 문자열
 */
export function formatTime(seconds) {
  if (seconds < 1e-6) return `${(seconds * 1e9).toFixed(2)} ns`;
  if (seconds < 1e-3) return `${(seconds * 1e6).toFixed(2)} μs`;
  if (seconds < 1) return `${(seconds * 1e3).toFixed(2)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * 에너지 분포 데이터 생성
 * @param {Array<number>} energies - 에너지 배열
 * @param {number} numBins - 빈 개수
 * @returns {Array} 에너지 분포 데이터
 */
export function createEnergyDistribution(energies, numBins = 50) {
  return createHistogram(energies, numBins).map(bin => ({
    energy: bin.binCenter,
    count: bin.count,
    probability: bin.frequency
  }));
}

/**
 * 데이터 정규화 (0-1 범위)
 * @param {Array<number>} data - 데이터 배열
 * @returns {Array<number>} 정규화된 데이터
 */
export function normalizeData(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  if (range === 0) return data.map(() => 0);
  
  return data.map(value => (value - min) / range);
}

/**
 * 색상 코드 생성 (값에 따른 그라데이션)
 * @param {number} value - 값 (0-1)
 * @param {string} colorScheme - 색상 스킴 ('blue', 'red', 'green')
 * @returns {string} RGB 색상 코드
 */
export function getColorByValue(value, colorScheme = 'blue') {
  const clampedValue = Math.max(0, Math.min(1, value));
  
  const schemes = {
    blue: [
      [230, 240, 255],  // 연한 파랑
      [59, 130, 246]    // 진한 파랑
    ],
    red: [
      [255, 230, 230],  // 연한 빨강
      [239, 68, 68]     // 진한 빨강
    ],
    green: [
      [230, 255, 230],  // 연한 초록
      [34, 197, 94]     // 진한 초록
    ]
  };
  
  const [light, dark] = schemes[colorScheme] || schemes.blue;
  
  const r = Math.round(light[0] + (dark[0] - light[0]) * clampedValue);
  const g = Math.round(light[1] + (dark[1] - light[1]) * clampedValue);
  const b = Math.round(light[2] + (dark[2] - light[2]) * clampedValue);
  
  return `rgb(${r}, ${g}, ${b})`;
}

export default {
  formatScientific,
  formatWithUnit,
  createHistogram,
  calculateStats,
  calculateCDF,
  movingAverage,
  arrayToCSV,
  downloadCSV,
  downloadJSON,
  chunkArray,
  linearInterpolate,
  logInterpolate,
  findNearestIndex,
  formatTime,
  createEnergyDistribution,
  normalizeData,
  getColorByValue
};