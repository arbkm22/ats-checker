# ATS Checker - Premium Resume Analysis 🚀

A cutting-edge, AI-powered Applicant Tracking System (ATS) checker that analyzes resumes against job descriptions with a stunning cyberpunk-inspired interface.

![ATS Checker](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality
- **Dynamic Matching**: Compare your resume against specific job descriptions
- **Intelligent Scoring**: Generate match scores (0-100) using a weighted algorithm
- **Deep Analysis**: Get structured breakdowns of strengths, gaps, and optimization tips
- **📝 Live Resume Markup**: See your resume annotated with hand-drawn style scribbles showing what recruiters notice (positive highlights in green, issues in red)

### 🛡️ Technical Constraints
- **Strict Validation**: Only `.pdf` and `.tex` (LaTeX) files accepted
- **Client-Side Validation**: Custom error states for invalid formats
- **Smart Processing**: Different parsing strategies for PDF vs LaTeX files

### 🎨 UI/UX Highlights
- **Bold Aesthetic**: Cyberpunk-minimalism with Glassmorphism effects
- **No Generic Blue**: Vibrant cyber colors (Purple, Pink, Blue, Green)
- **Interactive Animations**: Scanning effects and resume pulse indicators
- **Visual Analytics**: Skill Radar Charts and Keyword Heatmaps

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/arbkm22/ats-checker.git
cd ats-checker

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📦 System Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Animations**: Framer Motion
- **Charts**: Recharts for radar charts and visualizations
- **AI Processing**: OpenAI API integration (configurable)

### Project Structure
```
ats-checker/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions and API
├── types/            # TypeScript definitions
└── public/           # Static assets
```

## 📊 Scoring Algorithm

```
Match Score = 
  (Keyword Matching × 30%) +
  (Formatting Quality × 20%) +
  (Impact Verbs × 25%) +
  (Experience Relevance × 25%)
```

## 🎨 Design System

### Color Palette
- **Cyber Purple** (#B026FF): Primary accent
- **Cyber Pink** (#FF2E97): Warnings/Low scores
- **Cyber Blue** (#00D9FF): Information/Tips
- **Cyber Green** (#39FF14): Success/High scores
- **Neo Dark** (#0A0E27): Background

### Custom Components
1. **Upload Wizard**: Drag-and-drop with real-time validation
2. **Results Dashboard**: Interactive score display with animations
3. **Skill Radar**: Multi-dimensional skill visualization
4. **Keyword Heatmap**: Visual keyword match/miss representation
5. **Live Annotation Overlay**: PDF viewer with hand-drawn scribbles showing strengths and issues

## 🧠 LLM Prompt Engineering

The system uses a comprehensive prompt that:
- Analyzes resumes by weighted criteria
- Handles PDF and LaTeX files differently
- Provides structured, actionable feedback
- Focuses on ATS optimization

See `lib/api.ts` for the full system prompt.

## 📖 Documentation

For detailed documentation, see:
- [DOCUMENTATION.md](./DOCUMENTATION.md) - General documentation
- [LIVE_ANNOTATION_DOCS.md](./LIVE_ANNOTATION_DOCS.md) - Live Resume Annotation feature

Topics covered:
- Installation guide
- Configuration options
- API integration
- Custom theme setup
- Deployment instructions
- Live annotation system architecture and implementation

## 🛠️ Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔒 File Validation

The app enforces strict file type validation:
- **Accepted**: `.pdf`, `.tex`
- **Rejected**: All other file types with custom error messages
- **Size Limit**: 10MB maximum

## 📝 Usage

1. **Upload Resume**: Drag-and-drop or click to select (PDF or LaTeX)
2. **Paste Job Description**: Enter the complete job posting
3. **Analyze**: Click the gradient button to start analysis
4. **Review Results**: Explore your match score, radar chart, and recommendations
5. **View Live Markup**: Click "📝 VIEW LIVE MARKUP" to see your resume with hand-drawn annotations showing what recruiters notice

## 🎯 Deliverables Implemented

✅ **System Architecture**: Next.js + TypeScript + Tailwind CSS  
✅ **Frontend Code**: Creative Upload Wizard with validation  
✅ **Prompt Engineering**: Comprehensive LLM prompt for resume analysis  
✅ **Interactive Dashboard**: Radar charts, heatmaps, and score breakdowns  
✅ **Bold Design**: Cyberpunk aesthetic with glassmorphism  

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t ats-checker .
docker run -p 3000:3000 ats-checker
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Inspired by modern cyberpunk and glassmorphism design trends
- Built with Next.js 14 and React Server Components
- Powered by AI for intelligent analysis

---

**Made with 💜 by the ATS Checker team**
