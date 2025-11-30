import React from 'react';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ParametersPage from './pages/ParametersPage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';
import DetailPage from './pages/DetailPage';
import ExportPage from './pages/ExportPage';
import './App.css';

function AppContent() {
  const { currentPage } = useAnalysis();
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'upload':
        return <UploadPage />;
      case 'parameters':
        return <ParametersPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'results':
        return <ResultsPage />;
      case 'detail':
        return <DetailPage />;
      case 'export':
        return <ExportPage />;
      default:
        return <HomePage />;
    }
  };
  
  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
  );
}

export default App;