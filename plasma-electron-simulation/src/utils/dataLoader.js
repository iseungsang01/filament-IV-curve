// CSV 데이터 로더

/**
 * CSV 파일을 읽어서 파싱
 */
export const loadCSVData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = parseCSV(text);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * CSV 텍스트 파싱
 */
export const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있거나 형식이 잘못되었습니다');
  }
  
  // 헤더 파싱
  const headers = lines[0].split(',').map(h => h.trim());
  
  // 데이터 구조 초기화
  const data = {
    headers,
    energy: [],
    sigma_1s: [],
    sigma_2p: [],
    sigma_high: [],
    sigma_iz: []
  };
  
  // 각 컬럼의 인덱스 찾기
  const colIndices = {
    energy: findColumnIndex(headers, ['energy', 'e', 'eV']),
    sigma_1s: findColumnIndex(headers, ['1s', '1S', 'sigma_1s', 'excitation_1s']),
    sigma_2p: findColumnIndex(headers, ['2p', '2P', 'sigma_2p', 'excitation_2p']),
    sigma_high: findColumnIndex(headers, ['high', 'HIGH', 'sigma_high', 'excitation_high']),
    sigma_iz: findColumnIndex(headers, ['iz', 'IZ', 'ionization', 'sigma_iz'])
  };
  
  // 필수 컬럼 체크
  if (colIndices.energy === -1) {
    throw new Error('Energy 컬럼을 찾을 수 없습니다');
  }
  
  // 데이터 파싱
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    
    if (values.length < headers.length) {
      console.warn(`라인 ${i + 1}: 컬럼 수가 부족합니다`);
      continue;
    }
    
    try {
      const energy = parseFloat(values[colIndices.energy]);
      if (isNaN(energy)) continue;
      
      data.energy.push(energy);
      
      // 각 단면적 값 파싱
      data.sigma_1s.push(parseFloatSafe(values[colIndices.sigma_1s]));
      data.sigma_2p.push(parseFloatSafe(values[colIndices.sigma_2p]));
      data.sigma_high.push(parseFloatSafe(values[colIndices.sigma_high]));
      data.sigma_iz.push(parseFloatSafe(values[colIndices.sigma_iz]));
      
    } catch (error) {
      console.warn(`라인 ${i + 1} 파싱 오류:`, error.message);
    }
  }
  
  // 데이터 검증
  if (data.energy.length === 0) {
    throw new Error('유효한 데이터가 없습니다');
  }
  
  // 에너지 정렬 확인 및 정렬
  sortDataByEnergy(data);
  
  return data;
};

/**
 * 컬럼 인덱스 찾기 (여러 가능한 이름 중에서)
 */
const findColumnIndex = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h.toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
};

/**
 * 안전한 Float 파싱
 */
const parseFloatSafe = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

/**
 * 에너지 기준으로 데이터 정렬
 */
const sortDataByEnergy = (data) => {
  const indices = data.energy.map((_, i) => i);
  indices.sort((a, b) => data.energy[a] - data.energy[b]);
  
  const sortedData = {
    headers: data.headers,
    energy: indices.map(i => data.energy[i]),
    sigma_1s: indices.map(i => data.sigma_1s[i]),
    sigma_2p: indices.map(i => data.sigma_2p[i]),
    sigma_high: indices.map(i => data.sigma_high[i]),
    sigma_iz: indices.map(i => data.sigma_iz[i])
  };
  
  Object.assign(data, sortedData);
};

/**
 * CSV 데이터를 텍스트로 변환
 */
export const dataToCSV = (data) => {
  const lines = [data.headers.join(',')];
  
  for (let i = 0; i < data.energy.length; i++) {
    const row = [
      data.energy[i],
      data.sigma_1s[i],
      data.sigma_2p[i],
      data.sigma_high[i],
      data.sigma_iz[i]
    ].join(',');
    
    lines.push(row);
  }
  
  return lines.join('\n');
};

/**
 * 데이터 통계 정보
 */
export const getDataStatistics = (data) => {
  return {
    totalPoints: data.energy.length,
    energyRange: {
      min: Math.min(...data.energy),
      max: Math.max(...data.energy)
    },
    crossSectionRanges: {
      sigma_1s: {
        min: Math.min(...data.sigma_1s.filter(x => x > 0)),
        max: Math.max(...data.sigma_1s)
      },
      sigma_2p: {
        min: Math.min(...data.sigma_2p.filter(x => x > 0)),
        max: Math.max(...data.sigma_2p)
      },
      sigma_high: {
        min: Math.min(...data.sigma_high.filter(x => x > 0)),
        max: Math.max(...data.sigma_high)
      },
      sigma_iz: {
        min: Math.min(...data.sigma_iz.filter(x => x > 0)),
        max: Math.max(...data.sigma_iz)
      }
    }
  };
};