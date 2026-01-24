'use client';

import { useState } from 'react';
import UploadWizard from '@/components/UploadWizard';
import ResultsDashboard from '@/components/ResultsDashboard';
import { AnalysisResult } from '@/types';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyber-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center bg-gradient-cyber bg-clip-text text-transparent">
            ATS Checker
          </h1>
          <p className="text-center mt-2 text-gray-400">Premium Resume Analysis Powered by AI</p>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {!analysisResult && !isAnalyzing && (
          <UploadWizard 
            onAnalysisStart={() => setIsAnalyzing(true)}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        
        {isAnalyzing && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="glass p-8 rounded-2xl neo-border">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-4 border-cyber-purple/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-cyber-purple rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-cyber-pink rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                    Analyzing Your Resume
                  </h3>
                  <p className="text-gray-400 mt-2">This may take a few moments...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <ResultsDashboard result={analysisResult} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 ATS Checker. Built with Next.js, TypeScript, and AI.</p>
        </div>
      </footer>
    </main>
  );
}
