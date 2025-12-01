// 선형 회귀
export const linearFit = (x, y) => {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const c = (sumY - m * sumX) / n;
  
  // 오차 계산
  let sumResidual = 0;
  for (let i = 0; i < n; i++) {
    const predicted = m * x[i] + c;
    sumResidual += Math.pow(y[i] - predicted, 2);
  }
  
  const stdError = Math.sqrt(sumResidual / (n - 2));
  const mError = stdError * Math.sqrt(n / (n * sumXX - sumX * sumX));
  const cError = stdError * Math.sqrt(sumXX / (n * sumXX - sumX * sumX));
  
  return { m, c, mError, cError };
};

// Nonlinear Exponential Fit: I = a*exp(V/b) + c
export const exponentialFit = (V, I, initialGuess = [1e-3, 2.0, 1e-6]) => {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let [a, b, c] = initialGuess;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let sumDa = 0, sumDb = 0, sumDc = 0;
    let sumDaDa = 0, sumDbDb = 0, sumDcDc = 0;
    
    for (let i = 0; i < V.length; i++) {
      const predicted = a * Math.exp(V[i] / b) + c;
      const residual = I[i] - predicted;
      
      const expTerm = Math.exp(V[i] / b);
      const da = expTerm;
      const db = -a * V[i] * expTerm / (b * b);
      const dc = 1;
      
      sumDa += residual * da;
      sumDb += residual * db;
      sumDc += residual * dc;
      
      sumDaDa += da * da;
      sumDbDb += db * db;
      sumDcDc += dc * dc;
    }
    
    const deltaA = sumDa / sumDaDa * 0.1;
    const deltaB = sumDb / sumDbDb * 0.1;
    const deltaC = sumDc / sumDcDc * 0.1;
    
    a += deltaA;
    b += deltaB;
    c += deltaC;
    
    if (Math.abs(deltaA) < tolerance && Math.abs(deltaB) < tolerance && Math.abs(deltaC) < tolerance) {
      break;
    }
  }
  
  return { a, b, c };
};

// CL Model Fit
export const fitCLModel = (V, I, Vp, initialGuess = [-5e-6, 0.5]) => {
  const maxIterations = 100;
  const tolerance = 1e-8;
  
  let [iSat, a] = initialGuess;
  const T = 2.0; // Fixed temperature
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let sumDiSat = 0, sumDa = 0;
    let sumDiSatDiSat = 0, sumDaDa = 0;
    
    for (let i = 0; i < V.length; i++) {
      const base = Math.abs((Vp - V[i]) / T);
      const sheathTerm = base > 0 ? a * Math.pow(base, 0.75) : 0;
      const predicted = iSat * (1 + sheathTerm);
      const residual = I[i] - predicted;
      
      const diSat = 1 + sheathTerm;
      const da = base > 0 ? iSat * Math.pow(base, 0.75) : 0;
      
      sumDiSat += residual * diSat;
      sumDa += residual * da;
      
      sumDiSatDiSat += diSat * diSat;
      sumDaDa += da * da;
    }
    
    const deltaISat = sumDiSat / sumDiSatDiSat * 0.01;
    const deltaA = sumDa / sumDaDa * 0.01;
    
    iSat += deltaISat;
    a += deltaA;
    
    if (Math.abs(deltaISat) < tolerance && Math.abs(deltaA) < tolerance) {
      break;
    }
  }
  
  return { iSat, a, T };
};