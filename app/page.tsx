'use client';

import { useState } from 'react';
import UploadWizard from '@/components/UploadWizard';
import ResultsDashboard from '@/components/ResultsDashboard';
import { AnalysisResult } from '@/types';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null); // NEW: Store resume file

  const handleAnalysisComplete = (result: AnalysisResult, file: File) => {
    setAnalysisResult(result);
    setResumeFile(file); // NEW: Store the file for annotations
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setResumeFile(null); // NEW: Clear the file
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen relative bg-brutal-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-brutal-yellow border-4 border-brutal-black rotate-12 animate-float-brutal"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-brutal-pink border-4 border-brutal-black -rotate-12 animate-wiggle"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-brutal-cyan border-4 border-brutal-black rotate-45 animate-tilt"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-brutal-green border-4 border-brutal-black animate-bounce-slow"></div>
        <div className="dots-pattern absolute inset-0 opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-12 px-4 border-b-6 border-brutal-black bg-gradient-brutal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter transform -rotate-1">
              <span className="inline-block bg-brutal-white border-6 border-brutal-black px-6 py-2 shadow-brutal-xl animate-wiggle">
                ATS
              </span>
              <span className="inline-block bg-brutal-pink text-white border-6 border-brutal-black px-6 py-2 ml-4 shadow-brutal-xl transform rotate-2">
                CHECKER
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto bg-brutal-yellow border-4 border-brutal-black px-6 py-3 shadow-brutal inline-block transform -rotate-1">
              🚀 AI-POWERED RESUME ANALYSIS • GET HIRED FASTER
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {!analysisResult && !isAnalyzing && (
          <div className="animate-scale-in">
            <UploadWizard 
              onAnalysisStart={() => setIsAnalyzing(true)}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="brutal-card-yellow p-12 max-w-md w-full transform -rotate-2 animate-pulse-brutal">
              <div className="flex flex-col items-center space-y-8">
                {/* Creative loading animation */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-6 border-brutal-black bg-brutal-white animate-spin"></div>
                  <div className="absolute inset-2 border-6 border-brutal-black bg-brutal-pink animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-4 border-6 border-brutal-black bg-brutal-cyan animate-spin" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-brutal-yellow border-4 border-brutal-black animate-bounce"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black uppercase tracking-tight">
                    ANALYZING
                  </h3>
                  <p className="text-lg font-bold">
                    🔥 PROCESSING YOUR RESUME...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="animate-scale-in">
            {/* NEW: Pass resume file */}
            <ResultsDashboard 
              result={analysisResult} 
              onReset={handleReset} 
              resumeFile={resumeFile || undefined}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 mt-24 border-t-6 border-brutal-black bg-brutal-black text-brutal-yellow">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-black uppercase tracking-wider">
            © 2024 ATS CHECKER • BUILT WITH NEXT.JS & AI • NEOBRUTALISM DESIGN
          </p>
        </div>
      </footer>
    </main>
  );
}
