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
    if (uploadState.errors.resume) return 'brutal-upload error';
    if (uploadState.resume) return 'brutal-upload success';
    if (isDragging) return 'brutal-upload active';
    return 'brutal-upload';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Resume Upload Section */}
      <div className="brutal-card-cyan p-8 space-y-6 transform -rotate-1">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tight bg-brutal-black text-brutal-yellow px-4 py-2 inline-block transform rotate-1 shadow-brutal">
            📄 UPLOAD
          </h2>
          <p className="text-lg font-bold ml-2">
            PDF or LaTeX (.tex) files only!
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
          
          <div className="p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer">
            {uploadState.resume ? (
              <>
                <div className="w-20 h-20 bg-brutal-green border-6 border-brutal-black flex items-center justify-center transform rotate-12 shadow-brutal">
                  <svg className="w-10 h-10 text-brutal-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black uppercase">{uploadState.resume.name}</p>
                  <p className="text-sm font-bold mt-2">
                    {(uploadState.resume.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-brutal-yellow border-6 border-brutal-black flex items-center justify-center transform -rotate-12 shadow-brutal animate-wiggle">
                  <svg className="w-10 h-10 text-brutal-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black uppercase">
                    DROP IT HERE!
                  </p>
                  <p className="text-sm font-bold mt-2">
                    or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {uploadState.errors.resume && (
          <div className="brutal-card-pink p-4 transform rotate-1">
            <p className="font-black uppercase text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {uploadState.errors.resume}
            </p>
          </div>
        )}

        <div className="bg-brutal-yellow border-4 border-brutal-black p-4 shadow-brutal space-y-2">
          <h3 className="text-sm font-black uppercase">⚙️ File Processing:</h3>
          <ul className="text-xs font-bold space-y-1.5">
            <li>• PDF: Text extraction + layout analysis</li>
            <li>• LaTeX: Source code parsing for accuracy</li>
          </ul>
        </div>
      </div>

      {/* Job Description Section */}
      <div className="brutal-card-yellow p-8 space-y-6 transform rotate-1">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tight bg-brutal-black text-brutal-cyan px-4 py-2 inline-block transform -rotate-1 shadow-brutal">
            💼 JOB
          </h2>
          <p className="text-lg font-bold ml-2">
            Paste the complete job description!
          </p>
        </div>
        
        <textarea
          value={uploadState.jobDescription}
          onChange={handleJobDescriptionChange}
          placeholder="PASTE JOB DESCRIPTION HERE...

Include:
• Required skills
• Responsibilities  
• Experience needed
• Tech stack"
          className={`w-full h-64 brutal-input resize-none font-mono ${
            uploadState.errors.jobDescription ? 'ring-4 ring-brutal-pink' : ''
          }`}
        />
        
        {uploadState.errors.jobDescription && (
          <div className="brutal-card-pink p-4 transform -rotate-1">
            <p className="font-black uppercase text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {uploadState.errors.jobDescription}
            </p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!uploadState.resume || !uploadState.jobDescription.trim()}
          className={`w-full transform -rotate-1 ${
            uploadState.resume && uploadState.jobDescription.trim()
              ? 'brutal-btn-pink'
              : 'bg-gray-300 text-gray-500 border-4 border-gray-400 px-8 py-4 font-black uppercase cursor-not-allowed'
          }`}
        >
          {uploadState.resume && uploadState.jobDescription.trim() ? (
            <span className="flex items-center justify-center text-xl">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ⚡ ANALYZE NOW!
            </span>
          ) : (
            'COMPLETE ALL FIELDS'
          )}
        </button>
      </div>
    </div>
  );
}
