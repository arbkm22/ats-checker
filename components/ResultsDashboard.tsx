'use client';

import { AnalysisResult } from '@/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'text-cyber-green';
    if (score >= 50) return 'text-cyber-yellow';
    return 'text-cyber-pink';
  };

  const getScoreColorName = (score: number) => {
    if (score >= 75) return 'cyber-green';
    if (score >= 50) return 'cyber-yellow';
    return 'cyber-pink';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 75) return 'bg-gradient-score-high';
    if (score >= 50) return 'bg-gradient-score-mid';
    return 'bg-gradient-score-low';
  };

  // Prepare radar chart data
  const radarData = result.skillsAnalysis.map(skill => ({
    skill: skill.skill.length > 15 ? skill.skill.substring(0, 15) + '...' : skill.skill,
    score: skill.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      {/* Score Header */}
      <div className="glass p-8 rounded-2xl neo-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-cyber bg-clip-text text-transparent">
              Analysis Complete
            </h2>
            <p className="text-gray-400">Your resume has been analyzed against the job description</p>
          </div>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-neo-darker/80 border border-glass-border rounded-xl hover:border-cyber-purple transition-all"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>

      {/* Match Score Display */}
      <div className="glass p-8 rounded-2xl neo-border">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            {/* Animated circle background */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke={`url(#gradient-${getScoreColorName(result.matchScore)})`}
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${(result.matchScore / 100) * 565.48} 565.48`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient-cyber-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#39FF14" />
                  <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
                <linearGradient id="gradient-cyber-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <linearGradient id="gradient-cyber-pink" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2E97" />
                  <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold ${getScoreColorClass(result.matchScore)}`}>
                {result.matchScore}
              </span>
              <span className="text-gray-400 text-sm mt-2">Match Score</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
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
      <div className="glass p-8 rounded-2xl neo-border">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
          Skills Analysis Radar
        </h3>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#9CA3AF' }}
              />
              <Radar
                name="Skill Match"
                dataKey="score"
                stroke="#B026FF"
                fill="#B026FF"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keyword Heatmap */}
      <div className="glass p-8 rounded-2xl neo-border">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
          Keyword Match Heatmap
        </h3>
        <div className="space-y-6">
          {/* Matched Keywords */}
          <div>
            <h4 className="text-lg font-semibold text-cyber-green mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Matched Keywords ({result.keywordMatches.matched.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywordMatches.matched.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-cyber-green/20 border border-cyber-green rounded-lg text-cyber-green text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div>
            <h4 className="text-lg font-semibold text-cyber-pink mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Missing Keywords ({result.keywordMatches.missing.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywordMatches.missing.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-cyber-pink/20 border border-cyber-pink rounded-lg text-cyber-pink text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strengths */}
        <div className="glass p-6 rounded-2xl neo-border">
          <h3 className="text-xl font-bold mb-4 text-cyber-green flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-cyber-green mr-2">▸</span>
                <span className="text-gray-300 text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Gaps */}
        <div className="glass p-6 rounded-2xl neo-border">
          <h3 className="text-xl font-bold mb-4 text-cyber-pink flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Critical Gaps
          </h3>
          <ul className="space-y-3">
            {result.criticalGaps.map((gap, index) => (
              <li key={index} className="flex items-start">
                <span className="text-cyber-pink mr-2">▸</span>
                <span className="text-gray-300 text-sm">{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimization Tips */}
        <div className="glass p-6 rounded-2xl neo-border">
          <h3 className="text-xl font-bold mb-4 text-cyber-blue flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Optimization Tips
          </h3>
          <ul className="space-y-3">
            {result.optimizationTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-cyber-blue mr-2">▸</span>
                <span className="text-gray-300 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  const getColorClass = (s: number) => {
    if (s >= 75) return 'text-cyber-green';
    if (s >= 50) return 'text-cyber-yellow';
    return 'text-cyber-pink';
  };

  return (
    <div className="glass p-4 rounded-xl">
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      <div className={`text-2xl font-bold ${getColorClass(score)}`}>{score}%</div>
    </div>
  );
}
