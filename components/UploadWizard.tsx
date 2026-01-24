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

  const getUploadZoneClass = () => {
    if (uploadState.errors.resume) return 'upload-zone error';
    if (uploadState.resume) return 'upload-zone success';
    if (isDragging) return 'upload-zone active';
    return 'upload-zone';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Resume Upload Section */}
      <div className="card-elevated p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            Upload Your Resume
          </h2>
          <p className="text-slate-400 text-sm">
            PDF or LaTeX (.tex) format accepted
          </p>
        </div>
        
        <div
          className={getUploadZoneClass()}
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
          
          <div className="p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer">
            {uploadState.resume ? (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-refined">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-slate-100 font-medium">{uploadState.resume.name}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(uploadState.resume.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-200">
                    Drop your resume here
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    or click to browse files
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {uploadState.errors.resume && (
          <div className="flex items-start gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
            <svg className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-error-400 text-sm">{uploadState.errors.resume}</p>
          </div>
        )}

        <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl space-y-2">
          <h3 className="text-sm font-medium text-slate-300">File Processing</h3>
          <ul className="text-xs text-slate-400 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span><span className="text-slate-300 font-medium">PDF:</span> Text extraction with layout preservation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span><span className="text-slate-300 font-medium">LaTeX:</span> Source code analysis for technical accuracy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Job Description Section */}
      <div className="card-elevated p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            Job Description
          </h2>
          <p className="text-slate-400 text-sm">
            Paste the complete job posting for accurate analysis
          </p>
        </div>
        
        <textarea
          value={uploadState.jobDescription}
          onChange={handleJobDescriptionChange}
          placeholder="Paste the job description here...

Include all relevant details:
• Required skills and qualifications
• Responsibilities and duties  
• Experience requirements
• Preferred technologies or certifications"
          className={`w-full h-64 input-refined resize-none ${
            uploadState.errors.jobDescription ? 'border-error-500 focus:ring-error-500/50' : ''
          }`}
        />
        
        {uploadState.errors.jobDescription && (
          <div className="flex items-start gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
            <svg className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-error-400 text-sm">{uploadState.errors.jobDescription}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!uploadState.resume || !uploadState.jobDescription.trim()}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            uploadState.resume && uploadState.jobDescription.trim()
              ? 'btn-primary'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {uploadState.resume && uploadState.jobDescription.trim() ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Resume
            </span>
          ) : (
            'Complete All Fields to Continue'
          )}
        </button>
      </div>
    </div>
  );
}
