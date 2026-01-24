'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { FileUploadState, AnalysisResult } from '@/types';
import { analyzeResume } from '@/lib/api';

interface UploadWizardProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function UploadWizard({ onAnalysisStart, onAnalysisComplete }: UploadWizardProps) {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    resume: null,
    jobDescription: '',
    errors: {},
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileType = (file: File): boolean => {
    const validExtensions = ['.pdf', '.tex'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleFileSelect = (file: File) => {
    if (!validateFileType(file)) {
      setUploadState(prev => ({
        ...prev,
        resume: null,
        errors: {
          ...prev.errors,
          resume: 'Invalid file type. Only .pdf and .tex files are accepted.',
        },
      }));
      return;
    }

    // File size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        resume: null,
        errors: {
          ...prev.errors,
          resume: 'File size must be less than 10MB.',
        },
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      resume: file,
      errors: {
        ...prev.errors,
        resume: undefined,
      },
    }));
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 2000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUploadState(prev => ({
      ...prev,
      jobDescription: e.target.value,
      errors: {
        ...prev.errors,
        jobDescription: undefined,
      },
    }));
  };

  const handleAnalyze = async () => {
    // Validation
    const errors: FileUploadState['errors'] = {};
    
    if (!uploadState.resume) {
      errors.resume = 'Please upload your resume.';
    }
    
    if (!uploadState.jobDescription.trim()) {
      errors.jobDescription = 'Please enter a job description.';
    }

    if (Object.keys(errors).length > 0) {
      setUploadState(prev => ({ ...prev, errors }));
      return;
    }

    onAnalysisStart();
    
    try {
      const result = await analyzeResume(uploadState.resume!, uploadState.jobDescription);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setUploadState(prev => ({
        ...prev,
        errors: {
          resume: 'Analysis failed. Please try again.',
        },
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Resume Upload Section */}
      <div className="glass p-8 rounded-2xl neo-border">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
          Upload Your Resume
        </h2>
        
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
            isDragging 
              ? 'border-cyber-purple bg-cyber-purple/10 scale-105' 
              : uploadState.resume 
              ? 'border-cyber-green bg-cyber-green/5'
              : uploadState.errors.resume
              ? 'border-cyber-pink bg-cyber-pink/5'
              : 'border-glass-border hover:border-cyber-blue'
          } ${isPulsing ? 'animate-pulse-glow' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.tex"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
            {uploadState.resume ? (
              <>
                <svg className="w-16 h-16 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-center">
                  <p className="text-cyber-green font-semibold">{uploadState.resume.name}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {(uploadState.resume.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-cyber-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-center">
                  <p className="text-lg font-semibold">Drop your resume here</p>
                  <p className="text-sm text-gray-400 mt-2">or click to browse</p>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: <span className="text-cyber-purple">.pdf</span>, <span className="text-cyber-purple">.tex</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {uploadState.errors.resume && (
          <div className="mt-4 p-3 bg-cyber-pink/10 border border-cyber-pink rounded-lg">
            <p className="text-cyber-pink text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {uploadState.errors.resume}
            </p>
          </div>
        )}

        {/* File Type Information */}
        <div className="mt-6 p-4 glass rounded-lg">
          <h3 className="text-sm font-semibold text-cyber-blue mb-2">File Processing Info</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• <span className="text-cyber-purple">PDF files:</span> Text extraction with layout preservation</li>
            <li>• <span className="text-cyber-purple">LaTeX (.tex) files:</span> Raw source code analysis for technical accuracy</li>
          </ul>
        </div>
      </div>

      {/* Job Description Section */}
      <div className="glass p-8 rounded-2xl neo-border">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
          Job Description
        </h2>
        
        <textarea
          value={uploadState.jobDescription}
          onChange={handleJobDescriptionChange}
          placeholder="Paste the job description here...

Include:
• Required skills and qualifications
• Responsibilities and duties
• Experience requirements
• Preferred technologies"
          className={`w-full h-64 bg-neo-darker/50 border rounded-xl p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all ${
            uploadState.errors.jobDescription
              ? 'border-cyber-pink focus:ring-cyber-pink'
              : 'border-glass-border focus:ring-cyber-purple'
          }`}
        />
        
        {uploadState.errors.jobDescription && (
          <div className="mt-4 p-3 bg-cyber-pink/10 border border-cyber-pink rounded-lg">
            <p className="text-cyber-pink text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {uploadState.errors.jobDescription}
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!uploadState.resume || !uploadState.jobDescription.trim()}
          className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 ${
            uploadState.resume && uploadState.jobDescription.trim()
              ? 'bg-gradient-cyber cyber-glow text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {uploadState.resume && uploadState.jobDescription.trim() ? (
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Resume
            </span>
          ) : (
            'Complete All Fields'
          )}
        </button>
      </div>
    </div>
  );
}
