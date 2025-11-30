// Savitzky-Golay 필터
export const savgolFilter = (data, windowLength = 21, polyOrder = 3) => {
  if (data.length < windowLength) {
    windowLength = Math.max(5, Math.floor(data.length / 10) * 2 + 1);
  }
  
  const halfWindow = Math.floor(windowLength / 2);
  const result = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    if (i < halfWindow || i >= data.length - halfWindow) {
      result[i] = data[i];
    } else {
      let sum = 0;
      for (let j = -halfWindow; j <= halfWindow; j++) {
        sum += data[i + j];
      }
      result[i] = sum / windowLength;
    }
  }
  
  return result;
};

// 수치 미분 (gradient)
export const gradient = (y, x) => {
  const grad = new Array(y.length);
  
  for (let i = 0; i < y.length; i++) {
    if (i === 0) {
      grad[i] = (y[1] - y[0]) / (x[1] - x[0]);
    } else if (i === y.length - 1) {
      grad[i] = (y[i] - y[i-1]) / (x[i] - x[i-1]);
    } else {
      grad[i] = (y[i+1] - y[i-1]) / (x[i+1] - x[i-1]);
    }
  }
  
  return grad;
};

// FFT 로우패스 필터
export const fftLowPass = (data, cutoffFreq = 1.0) => {
  const n = data.length;
  const real = new Array(n);
  const imag = new Array(n).fill(0);
  
  // Simple FFT implementation (for demo - use library in production)
  for (let k = 0; k < n; k++) {
    real[k] = 0;
    for (let t = 0; t < n; t++) {
      const angle = 2 * Math.PI * t * k / n;
      real[k] += data[t] * Math.cos(angle);
    }
  }
  
  // Apply low-pass filter
  const filtered = new Array(n);
  for (let k = 0; k < n; k++) {
    const freq = k < n/2 ? k / n : (n - k) / n;
    const weight = freq < cutoffFreq ? 1 : 0;
    filtered[k] = real[k] * weight / n;
  }
  
  return filtered;
};