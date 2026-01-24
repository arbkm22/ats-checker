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
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-10 py-12 px-4 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                ATS Checker
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Intelligent resume analysis powered by AI. Get actionable insights to improve your job application success rate.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {!analysisResult && !isAnalyzing && (
          <div className="animate-fade-in">
            <UploadWizard 
              onAnalysisStart={() => setIsAnalyzing(true)}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex items-center justify-center min-h-[500px] animate-scale-in">
            <div className="card-elevated p-12 max-w-md w-full">
              <div className="flex flex-col items-center space-y-8">
                {/* Refined loading animation */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full animate-glow"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-100">
                    Analyzing Your Resume
                  </h3>
                  <p className="text-slate-400">
                    This may take a few moments...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="animate-fade-in">
            <ResultsDashboard result={analysisResult} onReset={handleReset} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 mt-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            © 2024 ATS Checker. Powered by Next.js, TypeScript, and AI.
          </p>
        </div>
      </footer>
    </main>
  );
}
