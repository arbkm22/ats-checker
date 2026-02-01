import { AnalysisResult, ResumeAnnotation, AnnotationType } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// System prompt for LLM to analyze resume
export const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of hiring practices, resume optimization, and keyword matching. Your task is to analyze a resume against a job description and provide a comprehensive evaluation.

ANALYSIS CRITERIA:

1. KEYWORD MATCHING (30% weight):
   - Identify required and preferred skills from the job description
   - Match keywords between resume and job description
   - Consider synonyms and related terms
   - Categorize into matched and missing keywords

2. FORMATTING QUALITY (20% weight):
   - Assess readability and structure
   - Evaluate use of bullet points, sections, and white space
   - Check for consistent formatting
   - For PDF: Analyze layout and visual hierarchy
   - For LaTeX (.tex): Evaluate source code structure, use of proper commands, and professional templates

3. IMPACT VERBS (25% weight):
   - Identify action verbs used (e.g., "Developed", "Managed", "Implemented")
   - Assess the strength and specificity of accomplishments
   - Look for quantifiable achievements
   - Evaluate STAR method usage (Situation, Task, Action, Result)

4. EXPERIENCE RELEVANCE (25% weight):
   - Match job responsibilities with candidate experience
   - Assess years of experience alignment
   - Evaluate relevance of previous roles
   - Consider industry and domain expertise

FILE PROCESSING INSTRUCTIONS:
- PDF files: Extract and analyze text content, preserving formatting context
- LaTeX (.tex) files: Parse raw source code to capture:
  * Technical accuracy in LaTeX commands
  * Professional structure (documentclass, packages used)
  * Content organization (sections, subsections)
  * Mathematical or technical notation (important for technical roles)

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "matchScore": <0-100>,
  "strengths": [<list of 3-5 key strengths>],
  "criticalGaps": [<list of 3-5 critical gaps>],
  "optimizationTips": [<list of 3-5 actionable tips>],
  "keywordMatches": {
    "matched": [<list of matched keywords>],
    "missing": [<list of important missing keywords>]
  },
  "skillsAnalysis": [
    {"skill": "<skill name>", "score": <0-100>}
  ],
  "experienceRelevance": <0-100>,
  "formattingScore": <0-100>,
  "impactVerbsScore": <0-100>
}

Be specific, constructive, and actionable in your feedback. Focus on what will most impact ATS parsing and human review.`;

// Mock analysis function - In production, this would call an LLM API
export async function analyzeResume(resumeFile: File, jobDescription: string): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract text from resume file
  const resumeText = await extractTextFromFile(resumeFile);

  // In production, this would call OpenAI or another LLM
  // For now, we'll return a mock analysis based on basic heuristics
  return generateMockAnalysis(resumeText, jobDescription, resumeFile.name);
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.tex')) {
    // For LaTeX files, read the raw source
    return await file.text();
  } else if (fileName.endsWith('.pdf')) {
    try {
      // Use pdfjs-dist to extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('[PDF Extraction] Successfully extracted text from PDF:', {
        fileName: file.name,
        pages: pdf.numPages,
        textLength: fullText.length
      });
      
      return fullText;
    } catch (error) {
      console.error('[PDF Extraction] Failed to extract text from PDF:', error);
      // Fallback to mock extraction if PDF parsing fails
      return `Mock PDF content extracted from ${file.name}. JavaScript TypeScript React Node.js AWS Docker Kubernetes Git CI/CD Python MongoDB PostgreSQL. Developed Implemented Led Managed Created Built Designed Achieved.`;
    }
  }
  
  return '';
}

function generateMockAnalysis(resumeText: string, jobDescription: string, fileName: string): AnalysisResult {
  // Simple keyword extraction
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  const matched = jdKeywords.filter(kw => 
    resumeKeywords.some(rk => rk.toLowerCase() === kw.toLowerCase())
  );
  const missing = jdKeywords.filter(kw => 
    !resumeKeywords.some(rk => rk.toLowerCase() === kw.toLowerCase())
  );

  // Calculate match score
  const keywordScore = matched.length > 0 ? (matched.length / jdKeywords.length) * 100 : 0;
  const formattingScore = fileName.endsWith('.tex') ? 85 : 75;
  const impactVerbsScore = countImpactVerbs(resumeText);
  const experienceScore = 70; // Mock value

  const matchScore = Math.round(
    keywordScore * 0.3 +
    formattingScore * 0.2 +
    impactVerbsScore * 0.25 +
    experienceScore * 0.25
  );

  // Generate skills analysis
  const skillsAnalysis = matched.slice(0, 6).map(skill => ({
    skill,
    score: Math.round(60 + Math.random() * 40),
  }));

  // Generate strengths, gaps, and tips
  const strengths = generateStrengths(matched, resumeText);
  const criticalGaps = generateGaps(missing);
  const optimizationTips = generateTips(matchScore, missing);

  // NEW: Generate annotations for live resume markup
  const annotations = generateAnnotations(matched, missing, resumeText);

  return {
    matchScore,
    strengths,
    criticalGaps,
    optimizationTips,
    keywordMatches: {
      matched: matched.slice(0, 15),
      missing: missing.slice(0, 10),
    },
    skillsAnalysis,
    experienceRelevance: experienceScore,
    formattingScore,
    impactVerbsScore,
    annotations, // NEW: Include annotations for overlay
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP
  const commonKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
    'Machine Learning', 'Data Analysis', 'SQL', 'MongoDB', 'PostgreSQL',
    'Leadership', 'Team Management', 'Agile', 'Scrum', 'Communication',
    'Problem Solving', 'Project Management', 'API Development', 'REST',
    'GraphQL', 'Microservices', 'Testing', 'TDD', 'DevOps'
  ];

  return commonKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

function countImpactVerbs(text: string): number {
  const impactVerbs = [
    'developed', 'managed', 'led', 'created', 'implemented', 'designed',
    'built', 'launched', 'improved', 'optimized', 'increased', 'reduced',
    'achieved', 'delivered', 'established', 'coordinated', 'executed'
  ];

  const count = impactVerbs.reduce((total, verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = text.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);

  return Math.min(Math.round((count / 10) * 100), 100);
}

function generateStrengths(matched: string[], resumeText: string): string[] {
  const strengths = [];
  
  if (matched.length > 5) {
    strengths.push(`Strong keyword alignment with ${matched.length} matched skills`);
  }
  
  if (resumeText.includes('led') || resumeText.includes('managed')) {
    strengths.push('Demonstrates leadership experience');
  }
  
  if (resumeText.match(/\d+%|\d+ years/gi)) {
    strengths.push('Includes quantifiable achievements');
  }
  
  strengths.push('Professional formatting and structure');
  strengths.push('Clear and concise presentation of experience');
  
  return strengths.slice(0, 5);
}

function generateGaps(missing: string[]): string[] {
  const gaps = [];
  
  if (missing.length > 0) {
    gaps.push(`Missing ${missing.length} key skills mentioned in job description`);
    gaps.push(`Specifically lacking: ${missing.slice(0, 3).join(', ')}`);
  }
  
  gaps.push('Could include more specific metrics and outcomes');
  gaps.push('Limited use of industry-specific terminology');
  
  return gaps.slice(0, 5);
}

function generateTips(matchScore: number, missing: string[]): string[] {
  const tips = [];
  
  if (matchScore < 75) {
    tips.push('Add more keywords from the job description naturally into your experience');
  }
  
  if (missing.length > 0) {
    tips.push(`Consider adding these skills if you have them: ${missing.slice(0, 3).join(', ')}`);
  }
  
  tips.push('Quantify your achievements with specific numbers and percentages');
  tips.push('Use strong action verbs at the beginning of each bullet point');
  tips.push('Tailor your resume summary to match the job description');
  
  return tips.slice(0, 5);
}

// NEW: Generate mock annotations for live resume markup
function generateAnnotations(matched: string[], missing: string[], resumeText: string): ResumeAnnotation[] {
  const annotations: ResumeAnnotation[] = [];
  
  // Create positive annotations for matched keywords
  // Use varied annotation types to make it visually interesting
  matched.slice(0, 6).forEach((keyword, index) => {
    // Alternate between different annotation types for variety
    const types: AnnotationType[] = ['circle', 'underline', 'highlight'];
    const annotationType = types[index % types.length];
    
    annotations.push({
      id: `pos-${index}`,
      text: keyword,
      sentiment: 'positive',
      annotationType,
      boundingBox: {
        pageNumber: 1,
        // Provide placeholder coordinates - the text layer search will find actual positions
        x: 100,
        y: 100,
        width: keyword.length * 10,
        height: 16,
      },
      reason: `Excellent! "${keyword}" matches the job requirements.`,
    });
  });

  // Add positive highlights for strong action verbs found in resume
  const strongVerbs = ['Developed', 'Implemented', 'Led', 'Managed', 'Created', 'Built', 'Designed', 'Achieved'];
  let verbCount = 0;
  strongVerbs.forEach((verb, index) => {
    // Check case-insensitive
    const lowerResumeText = resumeText.toLowerCase();
    if (lowerResumeText.includes(verb.toLowerCase()) && verbCount < 4) {
      verbCount++;
      annotations.push({
        id: `verb-${index}`,
        text: verb,
        sentiment: 'positive',
        annotationType: 'underline',
        boundingBox: {
          pageNumber: 1,
          x: 100,
          y: 200,
          width: verb.length * 10,
          height: 16,
        },
        reason: `Strong action verb that demonstrates impact!`,
      });
    }
  });

  return annotations;
}
