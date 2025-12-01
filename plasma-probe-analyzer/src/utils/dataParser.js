// ============================================
// src/utils/dataParser.js
// 데이터 파일 파싱 유틸리티
// ============================================

/**
 * 파일명에서 위치 정보 추출
 * 예: "data_10cm.dat" -> 10
 */
export function extractPositionFromFilename(filename) {
  const match = filename.match(/(\d+(?:\.\d+)?)\s*cm/i);
  return match ? parseFloat(match[1]) : null;
}

/**
 * 단일 파일 읽기 및 파싱
 */
export async function readAndParseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        const voltage = [];
        const current = [];
        
        for (let line of lines) {
          // 공백이나 탭으로 구분된 데이터 파싱
          const parts = line.trim().split(/\s+/);
          
          if (parts.length >= 2) {
            const v = parseFloat(parts[0]);
            const i = parseFloat(parts[1]);
            
            if (!isNaN(v) && !isNaN(i)) {
              voltage.push(v);
              current.push(i);
            }
          }
        }
        
        const position = extractPositionFromFilename(file.name);
        
        resolve({
          filename: file.name,
          voltage: voltage,
          current: current,
          dataPoints: voltage.length,
          position: position
        });
      } catch (error) {
        reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

/**
 * 여러 파일 동시 읽기
 */
export async function readAndParseMultipleFiles(files) {
  const promises = files.map(file => readAndParseFile(file));
  return Promise.all(promises);
}

/**
 * 데이터 유효성 검사
 */
export function validateData(fileData) {
  const errors = [];
  
  if (!fileData.voltage || fileData.voltage.length === 0) {
    errors.push('No voltage data found');
  }
  
  if (!fileData.current || fileData.current.length === 0) {
    errors.push('No current data found');
  }
  
  if (fileData.voltage.length !== fileData.current.length) {
    errors.push('Voltage and current arrays have different lengths');
  }
  
  if (fileData.voltage.length < 10) {
    errors.push('Insufficient data points (minimum 10 required)');
  }
  
  // 전압이 정렬되어 있는지 확인
  const isSorted = fileData.voltage.every((v, i) => 
    i === 0 || v >= fileData.voltage[i - 1]
  );
  
  if (!isSorted) {
    errors.push('Voltage data is not sorted in ascending order');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * 데이터 전처리 (이상치 제거, 스무딩 등)
 */
export function preprocessData(fileData) {
  // 간단한 이상치 제거 (Z-score 방법)
  const mean = fileData.current.reduce((a, b) => a + b, 0) / fileData.current.length;
  const std = Math.sqrt(
    fileData.current.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / fileData.current.length
  );
  
  const filtered = fileData.voltage
    .map((v, i) => ({
      voltage: v,
      current: fileData.current[i]
    }))
    .filter(point => Math.abs(point.current - mean) < 3 * std);
  
  return {
    ...fileData,
    voltage: filtered.map(p => p.voltage),
    current: filtered.map(p => p.current),
    dataPoints: filtered.length
  };
}