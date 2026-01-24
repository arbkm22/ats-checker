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
}

export interface FileUploadState {
  resume: File | null;
  jobDescription: string;
  errors: {
    resume?: string;
    jobDescription?: string;
  };
}
