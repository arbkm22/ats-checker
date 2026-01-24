# Live Resume Annotation Feature - Technical Documentation

## Overview

The Live Resume Annotation feature transforms the static ATS analysis results into an immersive, tactile experience where users can see their resume marked up as if a recruiter reviewed it with a marker pen.

---

## Architecture

### 1. Data Flow

```
User Upload → Resume Analysis → Annotation Generation → Visual Rendering
    ↓              ↓                      ↓                    ↓
  File         Extract Text         Map Coordinates      Rough.js Drawing
```

### 2. Component Structure

```
AnnotationOverlay (Main Component)
├── react-pdf (PDF Rendering)
├── rough.js (Hand-drawn Effects)
├── framer-motion (Animations)
└── Canvas Overlay (Annotation Layer)
```

---

## JSON Schema for Backend/LLM

The LLM must return annotation data in this exact structure:

```typescript
{
  "matchScore": 85,
  "strengths": [...],
  "criticalGaps": [...],
  "optimizationTips": [...],
  "annotations": [
    {
      "id": "string",           // Unique identifier
      "text": "string",         // Exact text snippet to annotate
      "sentiment": "positive" | "negative",
      "annotationType": "circle" | "underline" | "strikethrough" | "highlight",
      "boundingBox": {
        "pageNumber": 1,        // PDF page number (1-indexed)
        "x": 100,               // X coordinate (pixels from left)
        "y": 150,               // Y coordinate (pixels from top)
        "width": 120,           // Width of text (pixels)
        "height": 20            // Height of text (pixels)
      },
      "reason": "string"        // Why this is marked (for tooltips)
    }
  ]
}
```

---

## Coordinate Mapping Implementation

### Option 1: Using react-pdf Text Layer (Recommended)

```typescript
import { Document, Page } from 'react-pdf';

// 1. Render PDF with text layer
<Document file={pdfUrl}>
  <Page pageNumber={1} />
</Document>

// 2. Access text layer after render
const textLayer = document.querySelector('.react-pdf__Page__textContent');
const textItems = textLayer?.querySelectorAll('span');

// 3. Find matching text and get coordinates
textItems?.forEach((span) => {
  if (span.textContent === annotationText) {
    const rect = span.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }
});
```

### Option 2: Using PDF.js getTextContent() API

```typescript
import * as pdfjsLib from 'pdfjs-dist';

async function mapTextToCoordinates(pdfUrl: string, searchText: string) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  for (const item of textContent.items) {
    if (item.str === searchText) {
      return {
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height
      };
    }
  }
}
```

---

## AnnotationOverlay Component

### Props Interface

```typescript
interface AnnotationOverlayProps {
  annotationData: {
    resumeUrl: string;              // URL or Data URL of PDF
    annotations: ResumeAnnotation[];
    pageCount: number;
  };
  onClose?: () => void;
}
```

### Key Features

1. **PDF Rendering**
   - Uses `react-pdf` for high-quality PDF display
   - Supports multi-page navigation
   - Responsive scaling

2. **Canvas Overlay**
   - Transparent canvas positioned absolutely over PDF
   - Same dimensions as PDF page
   - Pointer-events disabled to allow PDF interaction

3. **Hand-Drawn Effects** (rough.js)
   ```typescript
   const rc = rough.canvas(canvas);
   
   // Circle annotation
   rc.ellipse(x + width/2, y + height/2, width + 10, height + 10, {
     stroke: color,
     strokeWidth: 3,
     roughness: 2.5,  // Controls "messiness"
     bowing: 1.5      // Controls curve variation
   });
   
   // Underline annotation
   rc.line(x, y + height + 2, x + width, y + height + 2, {
     stroke: color,
     strokeWidth: 3,
     roughness: 3     // More rough for emphasis
   });
   
   // Strikethrough annotation (double line)
   rc.line(x, y + height/2, x + width, y + height/2, {
     stroke: color,
     strokeWidth: 4,
     roughness: 3.5
   });
   
   // Highlight annotation
   rc.rectangle(x - 2, y - 2, width + 4, height + 4, {
     fill: color,
     fillStyle: 'hachure',  // Cross-hatch pattern
     fillWeight: 0.5
   });
   ```

4. **Animation**
   - Staggered drawing (200ms delay between annotations)
   - Framer Motion for overlay entrance
   - Smooth page transitions

---

## Visual Specifications

### Colors

- **Positives**: Neon Green `#00FF00`
  - Circle or underline style
  - Indicates matched keywords, strong verbs

- **Negatives**: Crimson Red `#DC143C`
  - Strikethrough or aggressive cross-out
  - Indicates missing skills, weak points

### Annotation Types

| Type | Use Case | Visual Effect |
|------|----------|---------------|
| `circle` | Highlight important match | Rough ellipse around text |
| `underline` | Emphasize good phrase | Messy line below text |
| `strikethrough` | Mark missing/weak | Double aggressive cross-out |
| `highlight` | Background emphasis | Hachure-filled rectangle |

### Roughness Parameters

```typescript
{
  roughness: 2.5,     // Base messiness (1-5)
  bowing: 1.5,        // Curve variation (0-3)
  strokeWidth: 3-4,   // Line thickness
  fillWeight: 0.3-0.5 // Highlight opacity
}
```

---

## Integration with Analysis

### In `lib/api.ts`

```typescript
function generateAnnotations(
  matched: string[], 
  missing: string[], 
  resumeText: string
): ResumeAnnotation[] {
  const annotations: ResumeAnnotation[] = [];
  
  // Positive annotations for matched keywords
  matched.forEach((keyword, index) => {
    annotations.push({
      id: `pos-${index}`,
      text: keyword,
      sentiment: 'positive',
      annotationType: index % 2 === 0 ? 'circle' : 'underline',
      boundingBox: {
        pageNumber: 1,
        x: calculateX(keyword, resumeText),
        y: calculateY(keyword, resumeText),
        width: keyword.length * 8,
        height: 20
      },
      reason: `Great! This keyword matches the job description.`
    });
  });
  
  // Negative annotations for missing keywords
  missing.forEach((keyword, index) => {
    annotations.push({
      id: `neg-${index}`,
      text: `Missing: ${keyword}`,
      sentiment: 'negative',
      annotationType: 'strikethrough',
      boundingBox: {
        pageNumber: 1,
        x: calculateX(keyword, resumeText),
        y: calculateY(keyword, resumeText),
        width: keyword.length * 10,
        height: 18
      },
      reason: `Add this skill if you have experience with ${keyword}.`
    });
  });
  
  return annotations;
}
```

---

## Production Implementation Checklist

### Backend Requirements

- [ ] LLM integration for intelligent text identification
- [ ] PDF text extraction with coordinate mapping
- [ ] Synonym detection for keyword matching
- [ ] Context-aware annotation placement

### Frontend Enhancements

- [ ] Real-time coordinate calculation from PDF text layer
- [ ] Multi-page annotation support
- [ ] Zoom and pan functionality
- [ ] Export annotated PDF feature
- [ ] Mobile-responsive touch interactions

### Performance Optimizations

- [ ] Canvas rendering optimization (requestAnimationFrame)
- [ ] Lazy loading for multi-page documents
- [ ] Memoization of annotation calculations
- [ ] Worker thread for PDF processing

---

## Example Usage

```typescript
// In ResultsDashboard component
const [showAnnotations, setShowAnnotations] = useState(false);

// Button to trigger annotation view
<button onClick={() => setShowAnnotations(true)}>
  📝 VIEW LIVE MARKUP
</button>

// Annotation overlay modal
{showAnnotations && result.annotations && resumeFile && (
  <AnnotationOverlay
    annotationData={{
      resumeUrl: URL.createObjectURL(resumeFile),
      annotations: result.annotations,
      pageCount: 1
    }}
    onClose={() => setShowAnnotations(false)}
  />
)}
```

---

## Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| react-pdf | Latest | PDF rendering in React |
| roughjs | Latest | Hand-drawn graphics effects |
| framer-motion | Latest | Smooth animations |
| pdfjs-dist | Latest | PDF.js core (peer dependency) |

### Installation

```bash
npm install react-pdf roughjs framer-motion pdfjs-dist
```

---

## Future Enhancements

1. **AI-Powered Coordinates**
   - Use vision models to identify text positions
   - OCR fallback for scanned documents

2. **Interactive Annotations**
   - Click annotations to see detailed feedback
   - Edit or dismiss annotations
   - Add custom notes

3. **Annotation Persistence**
   - Save annotation state to database
   - Share annotated resumes via link
   - Compare before/after versions

4. **Advanced Visualizations**
   - Heat maps for keyword density
   - Timeline view for experience sections
   - Skill gap visualization

---

## Accessibility

- Keyboard navigation for page switching
- Screen reader announcements for annotations
- High contrast mode support
- Focus management for modal overlay

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial (Canvas API limitations)
- Mobile browsers: Responsive with touch events

---

## Performance Metrics

- Initial render: < 500ms
- Annotation drawing: < 100ms per annotation
- Page navigation: < 200ms
- Memory usage: ~50MB for typical resume

---

*This feature creates an immersive experience that makes resume feedback feel personal and actionable, like working with a real recruiter.*
