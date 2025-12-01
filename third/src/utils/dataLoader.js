/**
 * Data Loader Utilities
 * CSV 파일 로드 및 파싱 유틸리티
 */

/**
 * CSV 파일 파싱
 * @param {string} csvText - CSV 텍스트
 * @returns {Object} 파싱된 데이터
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }
  
  // 헤더 파싱
  const headers = lines[0].split(',').map(h => h.trim());
  
  // 데이터 파싱
  const data = {
    headers,
    rows: []
  };
  
  // 각 열을 위한 배열 초기화
  headers.forEach(header => {
    data[header] = [];
  });
  
  // 데이터 행 파싱
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    
    const values = line.split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      console.warn(`Line ${i + 1} has ${values.length} values, expected ${headers.length}`);
      continue;
    }
    
    const row = {};
    headers.forEach((header, index) => {
      const value = parseFloat(values[index]);
      row[header] = isNaN(value) ? values[index] : value;
      data[header].push(row[header]);
    });
    
    data.rows.push(row);
  }
  
  return data;
}

/**
 * Cross Section CSV 전용 파서
 * @param {string} csvText - CSV 텍스트
 * @returns {Object} Cross Section 데이터
 */
export function parseCrossSectionCSV(csvText) {
  const parsed = parseCSV(csvText);
  
  // 필수 컬럼 확인
  const requiredColumns = ['Energy', '1S', '2P', 'HIGH', 'IZ'];
  const normalizedHeaders = parsed.headers.map(h => h.toUpperCase());
  
  const columnMapping = {
    energy: findColumn(normalizedHeaders, ['ENERGY', 'E']),
    sigma_1s: findColumn(normalizedHeaders, ['1S', 'EXCITATION_1S', 'EXC1S']),
    sigma_2p: findColumn(normalizedHeaders, ['2P', 'EXCITATION_2P', 'EXC2P']),
    sigma_high: findColumn(normalizedHeaders, ['HIGH', 'EXCITATION_HIGH', 'EXCHIGH']),
    sigma_iz: findColumn(normalizedHeaders, ['IZ', 'IONIZATION', 'ION'])
  };
  
  // 모든 필수 컬럼이 있는지 확인
  for (const [key, index] of Object.entries(columnMapping)) {
    if (index === -1) {
      throw new Error(`Required column not found for ${key}`);
    }
  }
  
  // 데이터 추출
  const result = {
    energy: [],
    sigma_1s: [],
    sigma_2p: [],
    sigma_high: [],
    sigma_iz: []
  };
  
  parsed.rows.forEach(row => {
    const originalHeaders = parsed.headers;
    result.energy.push(row[originalHeaders[columnMapping.energy]]);
    result.sigma_1s.push(row[originalHeaders[columnMapping.sigma_1s]]);
    result.sigma_2p.push(row[originalHeaders[columnMapping.sigma_2p]]);
    result.sigma_high.push(row[originalHeaders[columnMapping.sigma_high]]);
    result.sigma_iz.push(row[originalHeaders[columnMapping.sigma_iz]]);
  });
  
  // 데이터 검증
  validateCrossSectionData(result);
  
  return result;
}

/**
 * 컬럼 이름으로 인덱스 찾기
 * @param {Array<string>} headers - 헤더 배열
 * @param {Array<string>} possibleNames - 가능한 컬럼 이름들
 * @returns {number} 컬럼 인덱스 (-1 if not found)
 */
function findColumn(headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.indexOf(name.toUpperCase());
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Cross Section 데이터 검증
 * @param {Object} data - Cross Section 데이터
 */
function validateCrossSectionData(data) {
  const n = data.energy.length;
  
  if (n === 0) {
    throw new Error('No data points found in CSV');
  }
  
  // 모든 배열이 같은 길이인지 확인
  if (data.sigma_1s.length !== n || 
      data.sigma_2p.length !== n || 
      data.sigma_high.length !== n || 
      data.sigma_iz.length !== n) {
    throw new Error('Inconsistent data lengths in CSV columns');
  }
  
  // 에너지 값이 양수인지 확인
  if (data.energy.some(e => e <= 0)) {
    throw new Error('Energy values must be positive');
  }
  
  // 단면적 값이 음수가 아닌지 확인
  const allSigmas = [
    ...data.sigma_1s,
    ...data.sigma_2p,
    ...data.sigma_high,
    ...data.sigma_iz
  ];
  
  if (allSigmas.some(s => s < 0)) {
    throw new Error('Cross section values cannot be negative');
  }
  
  // 에너지가 오름차순인지 확인 (경고만)
  for (let i = 1; i < n; i++) {
    if (data.energy[i] <= data.energy[i-1]) {
      console.warn('Warning: Energy values are not in strictly increasing order');
      break;
    }
  }
}

/**
 * 파일에서 CSV 읽기
 * @param {File} file - 파일 객체
 * @returns {Promise<Object>} 파싱된 데이터
 */
export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      reject new Error('File must be a CSV file'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const data = parseCrossSectionCSV(csvText);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * URL에서 CSV 로드
 * @param {string} url - CSV 파일 URL
 * @returns {Promise<Object>} 파싱된 데이터
 */
export async function loadCSVFromURL(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCrossSectionCSV(csvText);
  } catch (error) {
    throw new Error(`Failed to load CSV from URL: ${error.message}`);
  }
}

/**
 * 샘플 Cross Section 데이터 생성
 * @returns {Object} 샘플 데이터
 */
export function generateSampleCrossSectionData() {
  const data = {
    energy: [],
    sigma_1s: [],
    sigma_2p: [],
    sigma_high: [],
    sigma_iz: []
  };
  
  // 0.1 eV부터 1000 eV까지 로그 스케일로
  for (let i = 0; i < 100; i++) {
    const energy = 0.1 * Math.pow(10, i / 33.33);
    data.energy.push(energy);
    
    // 간단한 모델로 단면적 근사
    // 1S 여기 (11.55 eV 이상)
    data.sigma_1s.push(energy > 11.55 ? 
      1e-20 * Math.exp(-(energy - 11.55) / 10) : 0);
    
    // 2P 여기 (12.91 eV 이상)
    data.sigma_2p.push(energy > 12.91 ? 
      8e-21 * Math.exp(-(energy - 12.91) / 15) : 0);
    
    // 고준위 여기
    data.sigma_high.push(energy > 13.5 ? 
      5e-21 * Math.exp(-(energy - 13.5) / 20) : 0);
    
    // 이온화 (15.76 eV 이상)
    data.sigma_iz.push(energy > 15.76 ? 
      3e-20 * Math.log(energy / 15.76) / energy : 0);
  }
  
  return data;
}

/**
 * 데이터 요약 정보 생성
 * @param {Object} data - Cross Section 데이터
 * @returns {Object} 요약 정보
 */
export function getDataSummary(data) {
  if (!data || !data.energy || data.energy.length === 0) {
    return {
      valid: false,
      message: 'No data available'
    };
  }
  
  const n = data.energy.length;
  
  return {
    valid: true,
    numPoints: n,
    energyRange: {
      min: Math.min(...data.energy),
      max: Math.max(...data.energy)
    },
    maxCrossSections: {
      sigma_1s: Math.max(...data.sigma_1s),
      sigma_2p: Math.max(...data.sigma_2p),
      sigma_high: Math.max(...data.sigma_high),
      sigma_iz: Math.max(...data.sigma_iz)
    },
    averageCrossSections: {
      sigma_1s: data.sigma_1s.reduce((a, b) => a + b, 0) / n,
      sigma_2p: data.sigma_2p.reduce((a, b) => a + b, 0) / n,
      sigma_high: data.sigma_high.reduce((a, b) => a + b, 0) / n,
      sigma_iz: data.sigma_iz.reduce((a, b) => a + b, 0) / n
    }
  };
}

/**
 * CSV 데이터를 텍스트로 변환
 * @param {Object} data - Cross Section 데이터
 * @returns {string} CSV 텍스트
 */
export function crossSectionDataToCSV(data) {
  const lines = ['Energy,1S,2P,HIGH,IZ'];
  
  for (let i = 0; i < data.energy.length; i++) {
    lines.push([
      data.energy[i],
      data.sigma_1s[i],
      data.sigma_2p[i],
      data.sigma_high[i],
      data.sigma_iz[i]
    ].join(','));
  }
  
  return lines.join('\n');
}

export default {
  parseCSV,
  parseCrossSectionCSV,
  readCSVFile,
  loadCSVFromURL,
  generateSampleCrossSectionData,
  getDataSummary,
  crossSectionDataToCSV
};