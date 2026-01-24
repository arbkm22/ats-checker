'use client';

import { AnalysisResult } from '@/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return { text: 'text-success-400', gradient: 'from-success-500 to-success-600', stroke: '#22c55e' };
    if (score >= 50) return { text: 'text-warning-400', gradient: 'from-warning-500 to-warning-600', stroke: '#f59e0b' };
    return { text: 'text-error-400', gradient: 'from-error-500 to-error-600', stroke: '#ef4444' };
  };

  const scoreColor = getScoreColor(result.matchScore);

  const radarData = result.skillsAnalysis.map(skill => ({
    skill: skill.skill.length > 12 ? skill.skill.substring(0, 12) + '...' : skill.skill,
    score: skill.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-elevated p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-100">
              Analysis Complete
            </h2>
            <p className="text-slate-400">
              Your resume has been analyzed against the job description
            </p>
          </div>
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all duration-200 border border-slate-700/50"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>

      {/* Match Score */}
      <div className="card-elevated p-10">
        <div className="flex flex-col items-center">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke="rgb(30, 41, 59)"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke={`url(#gradient-${result.matchScore})`}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(result.matchScore / 100) * 534.07} 534.07`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id={`gradient-${result.matchScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={scoreColor.stroke} stopOpacity="1" />
                  <stop offset="100%" stopColor={scoreColor.stroke} stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold ${scoreColor.text}`}>
                {result.matchScore}
              </span>
              <span className="text-slate-400 text-sm mt-2 font-medium">Match Score</span>
            </div>
          </div>

          {/* Component Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <ScoreCard 
              title="Keywords" 
              score={
                result.keywordMatches.matched.length + result.keywordMatches.missing.length > 0
                  ? Math.round((result.keywordMatches.matched.length / (result.keywordMatches.matched.length + result.keywordMatches.missing.length)) * 100)
                  : 0
              } 
            />
            <ScoreCard title="Formatting" score={result.formattingScore} />
            <ScoreCard title="Impact Verbs" score={result.impactVerbsScore} />
            <ScoreCard title="Experience" score={result.experienceRelevance} />
          </div>
        </div>
      </div>

      {/* Skills Radar Chart */}
      {result.skillsAnalysis.length > 0 && (
        <div className="card-elevated p-8">
          <h3 className="text-2xl font-semibold text-slate-100 mb-6">
            Skills Analysis
          </h3>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgb(51, 65, 85)" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: 'rgb(148, 163, 184)', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: 'rgb(100, 116, 139)', fontSize: 11 }}
                  stroke="rgb(51, 65, 85)"
                />
                <Radar
                  name="Skill Match"
                  dataKey="score"
                  stroke="rgb(168, 85, 247)"
                  fill="rgb(168, 85, 247)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Keyword Analysis */}
      <div className="card-elevated p-8 space-y-8">
        <h3 className="text-2xl font-semibold text-slate-100">
          Keyword Analysis
        </h3>
        
        {/* Matched Keywords */}
        {result.keywordMatches.matched.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-lg font-medium text-slate-200">
                Matched Keywords ({result.keywordMatches.matched.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywordMatches.matched.map((keyword, index) => (
                <span
                  key={index}
                  className="badge badge-success"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {result.keywordMatches.missing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h4 className="text-lg font-medium text-slate-200">
                Missing Keywords ({result.keywordMatches.missing.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywordMatches.missing.map((keyword, index) => (
                <span
                  key={index}
                  className="badge badge-error"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-refined">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-100">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-success-400 mt-1 flex-shrink-0">▸</span>
                <span className="text-slate-300 text-sm leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Gaps */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center shadow-refined">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-100">Critical Gaps</h3>
          </div>
          <ul className="space-y-3">
            {result.criticalGaps.map((gap, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-error-400 mt-1 flex-shrink-0">▸</span>
                <span className="text-slate-300 text-sm leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimization Tips */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-refined">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-100">Optimization Tips</h3>
          </div>
          <ul className="space-y-3">
            {result.optimizationTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary-400 mt-1 flex-shrink-0">▸</span>
                <span className="text-slate-300 text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 75) return 'text-success-400';
    if (s >= 50) return 'text-warning-400';
    return 'text-error-400';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 p-5 rounded-xl">
      <div className="text-sm text-slate-400 mb-2 font-medium">{title}</div>
      <div className={`text-3xl font-bold ${getColor(score)}`}>{score}%</div>
    </div>
  );
}
