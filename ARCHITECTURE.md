# System Architecture - ATS Checker

## Overview

The ATS Checker is a premium, AI-powered resume analysis application built with modern web technologies. It features a cyberpunk-inspired UI with glassmorphism effects and provides deep insights into resume-job description matching.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐  │
│  │   Upload     │────▶│   Analysis   │────▶│   Results    │  │
│  │   Wizard     │     │   Loading    │     │  Dashboard   │  │
│  └──────────────┘     └──────────────┘     └──────────────┘  │
│         │                     │                     │          │
│         └─────────────────────┴─────────────────────┘          │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               │ HTTP/Fetch API
                               │
┌──────────────────────────────┼─────────────────────────────────┐
│                      Next.js Server                             │
├──────────────────────────────┼─────────────────────────────────┤
│                              │                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              API Route (/api/analyze)                  │   │
│  │                                                         │   │
│  │  1. Receive resume file + job description              │   │
│  │  2. Extract text from file (.pdf or .tex)              │   │
│  │  3. Call LLM API with system prompt                    │   │
│  │  4. Parse and structure response                       │   │
│  │  5. Return analysis result                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
            ┌──────▼──────┐         ┌─────▼─────┐
            │   LLM API   │         │   File    │
            │  (OpenAI)   │         │ Processor │
            │             │         │           │
            │  - GPT-4    │         │ - PDF     │
            │  - System   │         │ - LaTeX   │
            │    Prompt   │         │           │
            └─────────────┘         └───────────┘
```

## Technology Stack

### Frontend Layer

#### Next.js 14
- **App Router**: Modern file-based routing
- **Server Components**: Optimized rendering
- **Client Components**: Interactive UI elements
- **API Routes**: Backend functionality

#### React 18
- **Hooks**: useState, useRef for state management
- **TypeScript**: Full type safety
- **Component Architecture**: Modular, reusable components

#### Tailwind CSS
- **Custom Theme**: Cyberpunk color palette
- **Utility-First**: Rapid UI development
- **Custom Animations**: Pulse, scan, float effects
- **Glassmorphism**: Backdrop blur effects

#### Visualization Libraries
- **Recharts**: Radar charts for skill analysis
- **Framer Motion**: Smooth animations (optional enhancement)

### Backend Layer

#### Next.js API Routes
- RESTful endpoint for analysis
- File upload handling
- LLM integration

#### File Processing
- **PDF Parsing**: pdf-parse library
- **LaTeX Processing**: Raw text extraction
- **Validation**: Client and server-side checks

#### AI Integration
- **OpenAI API**: GPT-4 for resume analysis
- **System Prompt**: Structured analysis criteria
- **JSON Response**: Structured output format

## Component Architecture

### Page Components

#### app/page.tsx
```typescript
Main Application Container
├── State Management (analysisResult, isAnalyzing)
├── UploadWizard Component
├── Loading Animation
└── ResultsDashboard Component
```

#### app/layout.tsx
```typescript
Root Layout
├── HTML Structure
├── Global CSS Import
├── Font Configuration
└── Metadata
```

### Feature Components

#### components/UploadWizard.tsx
```typescript
Upload Wizard
├── File Upload State
│   ├── resume: File | null
│   ├── jobDescription: string
│   └── errors: object
├── File Validation
│   ├── Type Check (.pdf, .tex)
│   ├── Size Check (10MB limit)
│   └── Error Handling
├── Drag & Drop Interface
│   ├── onDragOver
│   ├── onDragLeave
│   └── onDrop
├── Job Description Input
└── Analyze Button
```

#### components/ResultsDashboard.tsx
```typescript
Results Dashboard
├── Match Score Display
│   ├── Circular Progress
│   ├── Color Coding
│   └── Percentage
├── Score Breakdown
│   ├── Keywords Score
│   ├── Formatting Score
│   ├── Impact Verbs Score
│   └── Experience Score
├── Skills Radar Chart
│   └── Multi-dimensional visualization
├── Keyword Heatmap
│   ├── Matched Keywords
│   └── Missing Keywords
└── Analysis Grid
    ├── Strengths
    ├── Critical Gaps
    └── Optimization Tips
```

## Data Flow

### 1. User Upload Flow
```
User selects file
    │
    ▼
validateFileType()
    │
    ├─ Invalid ──▶ Display error
    │
    └─ Valid ───▶ Update state
                    │
                    ▼
              setIsPulsing(true)
                    │
                    ▼
              Visual feedback
```

### 2. Analysis Flow
```
User clicks "Analyze"
    │
    ▼
Validate inputs
    │
    ├─ Invalid ──▶ Show errors
    │
    └─ Valid ───▶ onAnalysisStart()
                    │
                    ▼
              Show loading animation
                    │
                    ▼
              analyzeResume(file, jd)
                    │
                    ├─ Extract text
                    ├─ Call LLM API
                    ├─ Parse response
                    │
                    ▼
              onAnalysisComplete(result)
                    │
                    ▼
              Render ResultsDashboard
```

### 3. File Processing Flow

#### PDF Files
```
File Upload
    │
    ▼
pdf-parse library
    │
    ├─ Extract text content
    ├─ Preserve layout info
    └─ Return plain text
        │
        ▼
    LLM Analysis
```

#### LaTeX Files
```
File Upload
    │
    ▼
file.text()
    │
    ├─ Read raw source
    ├─ Preserve LaTeX commands
    └─ Return raw content
        │
        ▼
    LLM Analysis
    (considers technical notation)
```

## LLM Integration Architecture

### System Prompt Structure

```typescript
SYSTEM_PROMPT = `
  1. Role Definition
     └─ Expert ATS analyzer
  
  2. Analysis Criteria (Weighted)
     ├─ Keyword Matching (30%)
     ├─ Formatting Quality (20%)
     ├─ Impact Verbs (25%)
     └─ Experience Relevance (25%)
  
  3. File Type Handling
     ├─ PDF: Text extraction + layout
     └─ LaTeX: Source code + technical notation
  
  4. Output Structure
     └─ JSON with specific fields
`
```

### Request Flow

```
analyzeResume()
    │
    ├─ Extract text from file
    │
    ├─ Construct prompt:
    │   ├─ System message: SYSTEM_PROMPT
    │   └─ User message: Resume + JD
    │
    ├─ Call OpenAI API:
    │   ├─ Model: gpt-4
    │   ├─ Temperature: 0.7
    │   └─ Response format: JSON
    │
    ├─ Parse JSON response
    │
    └─ Return AnalysisResult
```

## Scoring Algorithm

### Weighted Components

```typescript
matchScore = (
  keywordScore      * 0.30 +  // 30% weight
  formattingScore   * 0.20 +  // 20% weight
  impactVerbsScore  * 0.25 +  // 25% weight
  experienceScore   * 0.25    // 25% weight
)
```

### Keyword Score Calculation
```typescript
keywordScore = (matchedKeywords / totalKeywords) * 100
```

### Impact Verbs Score
```typescript
impactVerbsScore = min(
  (countOfImpactVerbs / 10) * 100,
  100
)
```

## UI/UX Architecture

### Design System

#### Color System
```typescript
colors: {
  'cyber-purple': '#B026FF',   // Primary
  'cyber-pink': '#FF2E97',     // Warning/Error
  'cyber-blue': '#00D9FF',     // Info
  'cyber-green': '#39FF14',    // Success
  'neo-dark': '#0A0E27',       // Background
}
```

#### Animation System
```typescript
animations: {
  'pulse-glow': '2s ease-in-out infinite',
  'scan': '2s linear infinite',
  'float': '3s ease-in-out infinite',
}
```

#### Visual Effects
1. **Glassmorphism**
   - Backdrop blur: 12px
   - Background: rgba(255, 255, 255, 0.05)
   - Border: rgba(255, 255, 255, 0.1)

2. **Neo-brutalism**
   - Bold 3px borders
   - Offset shadows
   - High contrast

3. **Cyberpunk**
   - Gradient overlays
   - Glow effects
   - Floating elements

## Security Considerations

### Input Validation
- File type whitelist (.pdf, .tex only)
- File size limit (10MB)
- Client-side validation
- Server-side verification

### Data Privacy
- No server-side file storage
- In-memory processing only
- No user data persistence
- Secure API key management

### API Security
- Environment variable for API keys
- Rate limiting (recommended)
- Error handling without data leakage

## Performance Optimization

### Frontend
- Component lazy loading
- Minimal re-renders
- Optimized bundle size
- Image optimization (Next.js)

### Backend
- Efficient file parsing
- Streaming responses (if large files)
- API response caching (optional)

### Network
- Compression (gzip/brotli)
- CDN for static assets
- Edge deployment (Vercel)

## Deployment Architecture

### Vercel (Recommended)
```
GitHub Repo
    │
    ▼
Vercel Build
    │
    ├─ Install dependencies
    ├─ Run next build
    ├─ Optimize assets
    │
    ▼
Edge Network
    │
    ├─ CDN (static files)
    ├─ Serverless functions (API)
    └─ Auto-scaling
```

### Environment Variables
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://...
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Serverless functions
- Edge network distribution

### Future Enhancements
- Database for analytics
- User authentication
- Resume history
- Batch processing
- PDF generation
- Email notifications

## Development Workflow

```
Local Development
    │
    ├─ npm run dev
    ├─ Hot reload
    └─ Local testing
        │
        ▼
Git Push
    │
    ▼
CI/CD (Vercel)
    │
    ├─ Automatic build
    ├─ Preview deployment
    └─ Production deployment
```

## Error Handling

### Client-Side
- Form validation errors
- File type errors
- Network errors
- User-friendly messages

### Server-Side
- API errors
- File processing errors
- LLM API failures
- Graceful degradation

## Monitoring & Analytics

### Recommended Tools
- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics

## Conclusion

This architecture provides:
- ✅ Scalable and maintainable codebase
- ✅ Modern, performant UI
- ✅ Secure file processing
- ✅ AI-powered analysis
- ✅ Exceptional user experience

The modular design allows for easy feature additions and modifications while maintaining code quality and performance.
