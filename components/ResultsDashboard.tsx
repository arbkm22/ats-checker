'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

// Dynamically import AnnotationOverlay to avoid SSR issues with PDF rendering
const AnnotationOverlay = dynamic(() => import('./AnnotationOverlay'), {
  ssr: false,
});

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  resumeFile?: File; // NEW: Pass the resume file for annotation
}

export default function ResultsDashboard({ result, onReset, resumeFile }: ResultsDashboardProps) {
  const [showAnnotations, setShowAnnotations] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-brutal-green', text: 'text-brutal-black', border: 'border-brutal-green' };
    if (score >= 50) return { bg: 'bg-brutal-yellow', text: 'text-brutal-black', border: 'border-brutal-yellow' };
    return { bg: 'bg-brutal-pink', text: 'text-white', border: 'border-brutal-pink' };
  };

  const scoreColor = getScoreColor(result.matchScore);

  const radarData = result.skillsAnalysis.map(skill => ({
    skill: skill.skill.length > 10 ? skill.skill.substring(0, 10) + '...' : skill.skill,
    score: skill.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="brutal-card p-8 transform rotate-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <h2 className="text-5xl font-black uppercase tracking-tight bg-brutal-black text-brutal-yellow px-6 py-3 inline-block transform -rotate-2 shadow-brutal">
              ✨ RESULTS!
            </h2>
            <p className="text-lg font-bold ml-2">
              Here&apos;s your resume analysis
            </p>
          </div>
          <div className="flex gap-3">
            {/* NEW: Live Annotation Button */}
            {result.annotations && result.annotations.length > 0 && resumeFile && (
              <button
                onClick={() => setShowAnnotations(true)}
                className="brutal-btn-pink transform -rotate-2"
              >
                📝 VIEW LIVE MARKUP
              </button>
            )}
            <button
              onClick={onReset}
              className="brutal-btn transform rotate-2"
            >
              🔄 ANALYZE AGAIN
            </button>
          </div>
        </div>
      </div>

      {/* Match Score - LARGE AND BOLD */}
      <div className={`${scoreColor.bg} border-6 border-brutal-black p-12 shadow-brutal-xl transform -rotate-1`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Giant Score Circle */}
          <div className="relative w-72 h-72">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke="#000000"
                strokeWidth="12"
                fill="white"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke="#000000"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(result.matchScore / 100) * 534.07} 534.07`}
                strokeLinecap="butt"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-8xl font-black">{result.matchScore}</span>
              <span className="text-2xl font-black uppercase mt-2">SCORE</span>
            </div>
          </div>

          {/* Component Scores - Stacked cards */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <ScoreCard title="KEYWORDS" score={
              result.keywordMatches.matched.length + result.keywordMatches.missing.length > 0
                ? Math.round((result.keywordMatches.matched.length / (result.keywordMatches.matched.length + result.keywordMatches.missing.length)) * 100)
                : 0
            } color="pink" />
            <ScoreCard title="FORMAT" score={result.formattingScore} color="cyan" />
            <ScoreCard title="IMPACT" score={result.impactVerbsScore} color="yellow" />
            <ScoreCard title="EXPERIENCE" score={result.experienceRelevance} color="green" />
          </div>
        </div>
      </div>

      {/* Skills Radar - Make it POP */}
      {result.skillsAnalysis.length > 0 && (
        <div className="brutal-card-purple p-8 transform rotate-1">
          <h3 className="text-4xl font-black uppercase mb-6 bg-brutal-yellow text-brutal-black px-4 py-2 inline-block transform -rotate-1 shadow-brutal">
            📊 SKILLS RADAR
          </h3>
          <div className="bg-white border-4 border-brutal-black p-4 w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#000000" strokeWidth={2} />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#000000', fontSize: 14, fontWeight: 900 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#000000', fontSize: 12, fontWeight: 700 }}
                  stroke="#000000"
                  strokeWidth={2}
                />
                <Radar
                  name="Skills"
                  dataKey="score"
                  stroke="#FF006E"
                  fill="#FF006E"
                  fillOpacity={0.6}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Keywords - BADGES EVERYWHERE */}
      <div className="brutal-card-cyan p-8 transform -rotate-1 space-y-8">
        <h3 className="text-4xl font-black uppercase bg-brutal-black text-brutal-yellow px-4 py-2 inline-block transform rotate-2 shadow-brutal">
          🔑 KEYWORDS
        </h3>
        
        {result.keywordMatches.matched.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <h4 className="text-2xl font-black uppercase">
                MATCHED ({result.keywordMatches.matched.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.keywordMatches.matched.map((keyword, index) => (
                <span
                  key={index}
                  className="brutal-badge-green transform hover:scale-110 hover:rotate-3 transition-transform"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.keywordMatches.missing.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <h4 className="text-2xl font-black uppercase">
                MISSING ({result.keywordMatches.missing.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.keywordMatches.missing.map((keyword, index) => (
                <span
                  key={index}
                  className="brutal-badge-red transform hover:scale-110 hover:-rotate-3 transition-transform"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights - 3 COLUMN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="brutal-card-green p-6 space-y-4 transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💪</span>
            <h3 className="text-2xl font-black uppercase">STRENGTHS</h3>
          </div>
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="font-black text-xl mt-1">▸</span>
                <span className="font-bold text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Gaps */}
        <div className="brutal-card-pink p-6 space-y-4 transform rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-2xl font-black uppercase">GAPS</h3>
          </div>
          <ul className="space-y-3">
            {result.criticalGaps.map((gap, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="font-black text-xl mt-1">▸</span>
                <span className="font-bold text-sm">{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimization Tips */}
        <div className="brutal-card-yellow p-6 space-y-4 transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💡</span>
            <h3 className="text-2xl font-black uppercase">TIPS</h3>
          </div>
          <ul className="space-y-3">
            {result.optimizationTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="font-black text-xl mt-1">▸</span>
                <span className="font-bold text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* NEW: Annotation Overlay Modal */}
      {showAnnotations && result.annotations && resumeFile && (
        <AnnotationOverlay
          annotationData={{
            resumeUrl: URL.createObjectURL(resumeFile),
            annotations: result.annotations,
            pageCount: 1,
          }}
          onClose={() => setShowAnnotations(false)}
        />
      )}
    </div>
  );
}

function ScoreCard({ title, score, color }: { title: string; score: number; color: string }) {
  const colorMap: Record<string, string> = {
    'pink': 'bg-brutal-pink text-white',
    'cyan': 'bg-brutal-cyan',
    'yellow': 'bg-brutal-yellow',
    'green': 'bg-brutal-green',
  };

  return (
    <div className={`${colorMap[color]} border-4 border-brutal-black p-4 shadow-brutal transform hover:scale-105 transition-transform`}>
      <div className="text-xs font-black uppercase mb-1">{title}</div>
      <div className="text-4xl font-black">{score}%</div>
    </div>
  );
}
