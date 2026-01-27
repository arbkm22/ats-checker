'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import rough from 'roughjs';
import { motion } from 'framer-motion';
import { ResumeAnnotation, AnnotationData } from '@/types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface AnnotationOverlayProps {
  annotationData: AnnotationData;
  onClose?: () => void;
}

export default function AnnotationOverlay({ annotationData, onClose }: AnnotationOverlayProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth - 32 : 800
  );
  const [pageRendered, setPageRendered] = useState<boolean>(false);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState<Map<number, { width: number; height: number }>>(new Map());

  // Helper function to get URL type for debugging without exposing full URL
  const getUrlType = (url: string): string => {
    if (url.startsWith('blob:')) return 'blob URL';
    if (url.startsWith('data:')) return 'data URL';
    if (url.startsWith('http://') || url.startsWith('https://')) return 'remote URL';
    return 'file path';
  };

  // Debug log on component mount and lock body scroll
  useEffect(() => {
    console.log('[AnnotationOverlay] Component mounted');
    console.log('[AnnotationOverlay] Received annotationData:', {
      resumeUrlType: getUrlType(annotationData.resumeUrl),
      annotationsCount: annotationData.annotations.length,
      pageCount: annotationData.pageCount,
    });
    console.log('[AnnotationOverlay] PDF.js version:', pdfjs.version);
    console.log('[AnnotationOverlay] PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);

    // Lock body scroll when overlay is open to prevent double scrollbars
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scroll when overlay is closed
      // Use empty string to restore to CSS-defined or default behavior
      document.body.style.overflow = originalOverflow || '';
    };
  }, [annotationData]);

  // Handle window resize for responsive PDF width
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth < 768 ? window.innerWidth - 32 : 800;
      setPageWidth(newWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('[AnnotationOverlay] PDF document loaded successfully');
    console.log('[AnnotationOverlay] Number of pages:', numPages);
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[AnnotationOverlay] PDF document failed to load');
    console.error('[AnnotationOverlay] Error details:', error);
    console.error('[AnnotationOverlay] Error message:', error.message);
    console.error('[AnnotationOverlay] Error stack:', error.stack);
    console.error('[AnnotationOverlay] Resume URL type that failed:', getUrlType(annotationData.resumeUrl));
    setPdfError(error.message || 'Failed to load PDF file');
  };

  const renderAnnotationsForPage = useCallback((pageNumber: number) => {
    console.log('[AnnotationOverlay] Rendering annotations for page', pageNumber);
    const canvas = canvasRefs.current.get(pageNumber);
    if (!canvas) {
      console.warn('[AnnotationOverlay] Canvas not found for page', pageNumber);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[AnnotationOverlay] Could not get 2D context for canvas');
      return;
    }

    // Get display pixel ratio for high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    
    // Get the page element to match canvas size to actual rendered PDF
    const pageElement = containerRef.current?.querySelector('.react-pdf__Page');
    if (!pageElement) {
      console.warn('[AnnotationOverlay] Page element not found');
      return;
    }
    
    const rect = pageElement.getBoundingClientRect();
    
    // Set canvas display size (CSS)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Set canvas internal size accounting for device pixel ratio for sharper rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the context to handle high-DPI displays
    ctx.scale(dpr, dpr);
    
    // Get the original PDF page dimensions for coordinate scaling
    const originalDimensions = pageDimensions.get(pageNumber);
    if (!originalDimensions) {
      console.warn('[AnnotationOverlay] Original page dimensions not available for page', pageNumber);
      return;
    }
    
    // Calculate scale factor from PDF coordinates to rendered coordinates
    const scaleX = rect.width / originalDimensions.width;
    const scaleY = rect.height / originalDimensions.height;
    
    console.log('[AnnotationOverlay] Canvas setup:', {
      displayWidth: rect.width,
      displayHeight: rect.height,
      bufferWidth: canvas.width,
      bufferHeight: canvas.height,
      devicePixelRatio: dpr,
      originalWidth: originalDimensions.width,
      originalHeight: originalDimensions.height,
      scaleX,
      scaleY
    });

    // Clear previous annotations
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initialize rough.js
    const rc = rough.canvas(canvas);

    // Filter annotations for this page
    const pageAnnotations = annotationData.annotations.filter(
      (ann) => ann.boundingBox?.pageNumber === pageNumber
    );
    console.log('[AnnotationOverlay] Found', pageAnnotations.length, 'annotations for page', pageNumber);

    // Try to find text positions in the text layer for more accurate positioning
    const textLayer = pageElement.querySelector('.react-pdf__Page__textContent');
    
    // Draw each annotation with hand-drawn effect
    pageAnnotations.forEach((annotation, index) => {
      if (!annotation.boundingBox) return;

      let { x, y, width, height } = annotation.boundingBox;
      let useDirectCoords = false; // Track if we found text in text layer
      
      // Try to find the actual text position in the text layer
      if (textLayer && annotation.text) {
        const textSpans = textLayer.querySelectorAll('span');
        for (const span of Array.from(textSpans)) {
          const spanText = span.textContent?.trim().toLowerCase() || '';
          const searchText = annotation.text.trim().toLowerCase();
          
          if (spanText.includes(searchText) || searchText.includes(spanText)) {
            // Found matching text! Use its actual position
            const spanRect = span.getBoundingClientRect();
            const pageRect = pageElement.getBoundingClientRect();
            
            // Convert to page-relative coordinates (already in rendered space)
            x = spanRect.left - pageRect.left;
            y = spanRect.top - pageRect.top;
            width = spanRect.width;
            height = spanRect.height;
            useDirectCoords = true;
            
            console.log('[AnnotationOverlay] Found text in PDF text layer:', {
              text: annotation.text,
              position: { x, y, width, height }
            });
            break;
          }
        }
      }
      
      // Determine final coordinates to use
      let finalX, finalY, finalWidth, finalHeight;
      
      if (useDirectCoords) {
        // Text found in text layer - coordinates are already in rendered space
        finalX = x;
        finalY = y;
        finalWidth = width;
        finalHeight = height;
      } else {
        // No text found - scale coordinates from PDF space to rendered canvas space
        finalX = x * scaleX;
        finalY = y * scaleY;
        finalWidth = width * scaleX;
        finalHeight = height * scaleY;
      }
      
      const color = annotation.sentiment === 'positive' ? '#00FF00' : '#DC143C'; // Neon Green or Crimson Red
      
      console.log('[AnnotationOverlay] Drawing annotation:', {
        text: annotation.text,
        original: { x, y, width, height },
        final: { x: finalX, y: finalY, width: finalWidth, height: finalHeight },
        foundInTextLayer: useDirectCoords
      });
      
      // Animate drawing with delay
      setTimeout(() => {
        drawAnnotation(rc, annotation, finalX, finalY, finalWidth, finalHeight, color);
      }, index * 200); // Stagger animations
    });
  }, [annotationData.annotations, pageDimensions]);

  const drawAnnotation = (
    rc: any,
    annotation: ResumeAnnotation,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    // Refined hand-drawn style - cleaner but still organic looking
    const options = {
      stroke: color,
      strokeWidth: 2.5,
      roughness: 1.2, // Reduced for cleaner look while keeping hand-drawn feel
      bowing: 0.8,
      fill: annotation.annotationType === 'highlight' ? color : undefined,
      fillStyle: 'solid' as const,
      fillWeight: annotation.annotationType === 'highlight' ? 0.3 : 1,
    };

    switch (annotation.annotationType) {
      case 'circle':
        // Draw refined circle around text
        rc.ellipse(
          x + width / 2,
          y + height / 2,
          width + 12,
          height + 12,
          {
            ...options,
            roughness: 1.0, // Smoother circle
          }
        );
        break;

      case 'underline':
        // Draw cleaner underline
        rc.line(x, y + height + 3, x + width, y + height + 3, {
          ...options,
          roughness: 1.5,
          strokeWidth: 2,
        });
        break;

      case 'strikethrough':
        // Draw cleaner cross-out
        rc.line(x, y + height / 2, x + width, y + height / 2, {
          ...options,
          strokeWidth: 3,
          roughness: 1.8,
        });
        // Add second line for emphasis (slightly offset)
        rc.line(x, y + height / 2 + 4, x + width, y + height / 2 + 4, {
          ...options,
          strokeWidth: 2,
          roughness: 2.0,
        });
        break;

      case 'highlight':
        // Draw cleaner rectangle highlight
        rc.rectangle(x - 2, y - 2, width + 4, height + 4, {
          ...options,
          fill: color,
          fillStyle: 'solid' as const,
          fillWeight: 0.3,
          roughness: 0.8,
        });
        break;
    }
  };

  // Render annotations when page is fully rendered
  // Small delay ensures the DOM is fully updated after PDF.js renders the page
  useEffect(() => {
    if (!pageRendered) return;
    
    const timer = setTimeout(() => {
      renderAnnotationsForPage(currentPage);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage, pageRendered, renderAnnotationsForPage]);

  // Handle page navigation
  const handlePageChange = (delta: number) => {
    setPageRendered(false);
    setCurrentPage((p) => {
      const newPage = p + delta;
      return Math.max(1, Math.min(numPages, newPage));
    });
  };

  return (
    <div className="fixed inset-0 bg-brutal-black/90 z-50 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-4 md:p-8"
      >
        {/* Header */}
        <div className="brutal-card-yellow p-4 md:p-6 mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transform -rotate-1">
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase">
              📝 LIVE RESUME MARKUP
            </h2>
            <p className="font-bold text-sm md:text-base mt-2">
              See your resume through a recruiter&apos;s eyes!
            </p>
          </div>
          <button
            onClick={onClose}
            className="brutal-btn transform rotate-2 text-sm md:text-base px-4 md:px-8 py-3 md:py-4"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-6">
          <div className="brutal-card-green p-4 transform rotate-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-4 border-brutal-black bg-brutal-green flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-black uppercase">POSITIVES</h3>
                <p className="text-sm font-bold">Circled or underlined in neon green</p>
              </div>
            </div>
          </div>
          <div className="brutal-card-pink p-4 transform -rotate-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-4 border-brutal-black bg-brutal-pink flex items-center justify-center">
                <span className="text-2xl text-white">✗</span>
              </div>
              <div>
                <h3 className="font-black uppercase text-white">NEGATIVES</h3>
                <p className="text-sm font-bold text-white">Crossed out in crimson red</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer with Annotation Overlay */}
        <div className="brutal-card p-4 md:p-6 relative">
          {pdfError && (
            <div className="brutal-card-pink p-4 mb-4">
              <p className="font-black text-white">⚠️ PDF Error: {pdfError}</p>
              <p className="text-sm text-white mt-2">Check the browser console for detailed error logs.</p>
            </div>
          )}
          <div className="relative inline-block" ref={containerRef}>
            <Document
              file={annotationData.resumeUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-8 text-center">
                  <p className="font-black">Loading PDF...</p>
                </div>
              }
              error={
                <div className="p-8 text-center brutal-card-pink">
                  <p className="font-black text-white">Failed to load PDF file.</p>
                  <p className="text-sm text-white mt-2">Check console for details.</p>
                </div>
              }
              className="border-4 border-brutal-black"
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  console.log('[AnnotationOverlay] Page', currentPage, 'loaded successfully');
                  console.log('[AnnotationOverlay] Original page dimensions:', {
                    width: page.originalWidth,
                    height: page.originalHeight
                  });
                  // Store original page dimensions for coordinate scaling
                  setPageDimensions(prev => {
                    const newMap = new Map(prev);
                    newMap.set(currentPage, {
                      width: page.originalWidth,
                      height: page.originalHeight
                    });
                    return newMap;
                  });
                }}
                onRenderSuccess={() => {
                  console.log('[AnnotationOverlay] Page', currentPage, 'rendered successfully');
                  setPageRendered(true);
                }}
                onLoadError={(error) => {
                  console.error('[AnnotationOverlay] Page', currentPage, 'failed to load');
                  console.error('[AnnotationOverlay] Page error:', error);
                }}
                loading={
                  <div className="p-4 text-center">
                    <p className="font-bold">Loading page {currentPage}...</p>
                  </div>
                }
              />
            </Document>

            {/* Annotation Canvas Overlay */}
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current.set(currentPage, el);
              }}
              className="absolute top-0 left-0 pointer-events-none"
            />
          </div>

          {/* Page Navigation */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={currentPage <= 1}
                className="brutal-btn-pink disabled:opacity-50 text-sm md:text-base px-4 md:px-8 py-3 md:py-4"
              >
                ← PREV
              </button>
              <span className="font-black text-base md:text-xl">
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage >= numPages}
                className="brutal-btn-pink disabled:opacity-50 text-sm md:text-base px-4 md:px-8 py-3 md:py-4"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>

        {/* Annotation Details */}
        <div className="brutal-card-cyan p-4 md:p-6 mt-4 md:mt-6 transform rotate-1">
          <h3 className="text-xl md:text-2xl font-black uppercase mb-4">
            🎯 MARKED ITEMS ({annotationData.annotations.length})
          </h3>
          <div className="space-y-3">
            {annotationData.annotations.map((annotation) => (
              <motion.div
                key={annotation.id}
                className={`p-3 border-3 border-brutal-black ${
                  annotation.sentiment === 'positive'
                    ? 'bg-brutal-green'
                    : 'bg-brutal-pink text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredAnnotation(annotation.id)}
                onHoverEnd={() => setHoveredAnnotation(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-black text-sm uppercase">
                      {annotation.annotationType} - &quot;{annotation.text}&quot;
                    </p>
                    {annotation.reason && (
                      <p className="text-sm font-bold mt-1 opacity-80">
                        {annotation.reason}
                      </p>
                    )}
                  </div>
                  <span className="text-2xl ml-3">
                    {annotation.sentiment === 'positive' ? '✓' : '✗'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
