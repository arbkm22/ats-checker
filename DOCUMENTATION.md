# ATS Checker - Premium Resume Analysis Application

A modern, AI-powered Applicant Tracking System (ATS) checker that analyzes resumes against job descriptions with stunning visual design and comprehensive insights.

## 🚀 Features

### Core Functionality
- **Dynamic Matching**: Compare resumes against specific job descriptions
- **Scoring Engine**: Generate match scores (0-100) using weighted algorithms
  - Keywords (30%)
  - Formatting (20%)
  - Impact Verbs (25%)
  - Experience Relevance (25%)
- **Deep Analysis**: Structured breakdown of:
  - Strengths
  - Critical Gaps
  - Actionable Optimization Tips

### Technical Features
- **File Support**: Strict validation for `.pdf` and `.tex` (LaTeX) files
- **Client-Side Validation**: Custom error states for invalid file types
- **Smart Processing**: 
  - PDF: Text extraction with layout preservation
  - LaTeX: Raw source code analysis for technical accuracy

### UI/UX Features
- **Bold Aesthetic**: Cyberpunk-minimalism meets Glassmorphism
- **Color Palette**: Avoiding generic "SaaS Blue" with vibrant cyber colors
- **Interactive Elements**:
  - Scanning animations during analysis
  - Resume Pulse that changes color based on match score
  - Skill Radar Chart for visual skill representation
  - Keyword Match Heatmap
  - Impact score cards

## 📋 System Architecture

### Tech Stack

```
Frontend:
├── Next.js 14 (React Framework)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
└── Recharts (Data Visualization)

Backend/Processing:
├── Next.js API Routes
├── OpenAI API (LLM Integration) *
└── PDF-Parse (PDF Processing)

* Note: Currently using mock analysis for demonstration
```

### Project Structure

```
ats-checker/
├── app/
│   ├── globals.css           # Global styles and custom effects
│   ├── layout.tsx             # Root layout with metadata
│   └── page.tsx               # Main application page
├── components/
│   ├── UploadWizard.tsx       # File upload and JD input component
│   └── ResultsDashboard.tsx   # Results visualization component
├── lib/
│   └── api.ts                 # API functions and LLM prompt logic
├── types/
│   └── index.ts               # TypeScript type definitions
├── tailwind.config.ts         # Tailwind configuration with custom theme
├── package.json               # Dependencies and scripts
└── next.config.js             # Next.js configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/arbkm22/ats-checker.git
   cd ats-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (Optional for LLM integration)
   Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette

```css
Cyber Purple:  #B026FF  (Primary accent)
Cyber Pink:    #FF2E97  (Warning/Low scores)
Cyber Blue:    #00D9FF  (Info/Tips)
Cyber Green:   #39FF14  (Success/High scores)
Cyber Yellow:  #FFD700  (Medium scores)
Neo Dark:      #0A0E27  (Background)
Neo Darker:    #050812  (Deeper background)
```

### Design Principles

1. **Glassmorphism**: Frosted glass effects with backdrop blur
2. **Neo-brutalism**: Bold borders and offset shadows
3. **Cyberpunk**: Vibrant gradient overlays and glowing effects
4. **Micro-interactions**: Smooth animations and transitions

### Custom Animations

- `pulse-glow`: Breathing effect for file upload states
- `scan`: Linear scanning animation during analysis
- `float`: Smooth floating effect for background elements

## 🧠 LLM Prompt Engineering

### System Prompt Overview

The application uses a comprehensive system prompt that instructs the LLM to:

1. **Analyze by weighted criteria**:
   - Keyword Matching (30%)
   - Formatting Quality (20%)
   - Impact Verbs (25%)
   - Experience Relevance (25%)

2. **Handle different file types**:
   - PDF: Extract and analyze text content
   - LaTeX: Parse source code for technical accuracy

3. **Provide structured output**:
   - Match score
   - Strengths array
   - Critical gaps array
   - Optimization tips array
   - Keyword analysis (matched/missing)
   - Skills analysis with individual scores
   - Component scores

### Prompt Location
The full system prompt is defined in `lib/api.ts` as `SYSTEM_PROMPT`.

### Customization
To modify the analysis criteria:
1. Edit the `SYSTEM_PROMPT` constant in `lib/api.ts`
2. Adjust weights in the prompt
3. Update the output structure if needed

## 📊 Analysis Components

### Match Score Calculation

```typescript
matchScore = 
  (keywordScore × 0.3) +
  (formattingScore × 0.2) +
  (impactVerbsScore × 0.25) +
  (experienceScore × 0.25)
```

### Visualization Components

1. **Circular Progress Indicator**: Animated SVG circle showing overall match score
2. **Radar Chart**: Multi-dimensional view of skill matches
3. **Keyword Heatmap**: Visual representation of matched vs. missing keywords
4. **Score Cards**: Individual component scores with color coding

## 🔒 Validation & Security

### Client-Side Validation
- File type checking (`.pdf`, `.tex` only)
- File size limit (10MB)
- Custom error messages
- Real-time validation feedback

### File Processing
- Secure file reading
- No server-side storage (privacy-first)
- Client-side text extraction

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Build for Production
```bash
npm run build
npm start
```

## 🔧 Configuration

### Tailwind Customization
Edit `tailwind.config.ts` to modify:
- Colors
- Animations
- Gradients
- Custom utilities

### Next.js Configuration
Edit `next.config.js` for:
- Server actions
- Image optimization
- API routes

## 📝 Usage Guide

### For Users

1. **Upload Resume**
   - Click or drag-and-drop your resume (`.pdf` or `.tex`)
   - Supported formats are strictly validated

2. **Paste Job Description**
   - Copy the full job description from the posting
   - Include requirements, responsibilities, and qualifications

3. **Analyze**
   - Click "Analyze Resume"
   - Wait for processing (2-5 seconds)

4. **Review Results**
   - Check your match score
   - Review strengths and gaps
   - Implement optimization tips
   - Use the radar chart to identify skill gaps

### For Developers

#### Adding New Analysis Features

1. Update the `AnalysisResult` type in `types/index.ts`
2. Modify the analysis logic in `lib/api.ts`
3. Update the UI in `ResultsDashboard.tsx`

#### Integrating Real LLM

Replace the mock analysis in `lib/api.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(resumeFile: File, jobDescription: string) {
  const resumeText = await extractTextFromFile(resumeFile);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` }
    ],
  });
  
  return JSON.parse(completion.choices[0].message.content);
}
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by cyberpunk and glassmorphism trends
- Built with modern React and Next.js best practices
- Powered by AI for intelligent resume analysis

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ and cutting-edge technology**
