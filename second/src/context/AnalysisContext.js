// ============================================
// src/context/AnalysisContext.js
// 전역 상태 관리 Context
// ============================================
import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState('home');
  
  // 업로드된 파일들
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // 분석 파라미터
  const [parameters, setParameters] = useState({
    probeRadius: 0.0005,        // 0.5 mm
    ionMass: 6.63e-26,          // Ar mass in kg
    magneticField: 0.001,       // 0.001 T = 10 Gauss
    maxIterations: 100,
    tolerance: 1e-6,
    aCoefficient: 0.5
  });
  
  // 분석 진행 상태
  const [analysisStatus, setAnalysisStatus] = useState({
    isRunning: false,
    currentFileIndex: 0,
    currentFile: '',
    currentIteration: 0
  });
  
  // 분석 결과
  const [analysisResults, setAnalysisResults] = useState([]);
  
  // 선택된 상세 결과
  const [selectedResult, setSelectedResult] = useState(null);
  
  // 파일 추가
  const addFiles = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };
  
  // 파일 제거
  const removeFile = (filename) => {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename));
  };
  
  // 모든 파일 제거
  const clearFiles = () => {
    setUploadedFiles([]);
  };
  
  // 파라미터 업데이트
  const updateParameters = (newParams) => {
    setParameters(newParams);
  };
  
  // 분석 진행상황 업데이트
  const updateAnalysisProgress = (fileIndex, filename, iteration, maxIterations) => {
    setAnalysisStatus({
      isRunning: true,
      currentFileIndex: fileIndex,
      currentFile: filename,
      currentIteration: iteration
    });
  };
  
  // 분석 완료
  const completeAnalysis = (results) => {
    setAnalysisResults(results);
    setAnalysisStatus(prev => ({
      ...prev,
      isRunning: false
    }));
  };
  
  // 분석 리셋
  const resetAnalysis = () => {
    setUploadedFiles([]);
    setAnalysisResults([]);
    setSelectedResult(null);
    setAnalysisStatus({
      isRunning: false,
      currentFileIndex: 0,
      currentFile: '',
      currentIteration: 0
    });
  };
  
  const value = {
    currentPage,
    setCurrentPage,
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
    parameters,
    updateParameters,
    analysisStatus,
    updateAnalysisProgress,
    completeAnalysis,
    analysisResults,
    selectedResult,
    setSelectedResult,
    resetAnalysis
  };
  
  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}