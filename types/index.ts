export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  criticalGaps: string[];
  optimizationTips: string[];
  keywordMatches: {
    matched: string[];
    missing: string[];
  };
  skillsAnalysis: {
    skill: string;
    score: number;
  }[];
  experienceRelevance: number;
  formattingScore: number;
  impactVerbsScore: number;
  annotations?: ResumeAnnotation[]; // NEW: For live resume markup
}

export interface FileUploadState {
  resume: File | null;
  jobDescription: string;
  errors: {
    resume?: string;
    jobDescription?: string;
  };
}

// NEW: Annotation types for Live Resume Annotation feature
export type AnnotationType = 'circle' | 'underline' | 'strikethrough' | 'highlight';
export type AnnotationSentiment = 'positive' | 'negative';

export interface ResumeAnnotation {
  id: string;
  text: string; // The exact text snippet to annotate
  sentiment: AnnotationSentiment;
  annotationType: AnnotationType;
  boundingBox?: {
    // Coordinates on the PDF page
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  reason?: string; // Why this is marked (for tooltips)
}

export interface AnnotationData {
  resumeUrl: string; // URL or data URL of the resume PDF
  annotations: ResumeAnnotation[];
  pageCount: number;
}
