'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import rough from 'roughjs';
import { motion } from 'framer-motion';
import { ResumeAnnotation, AnnotationData } from '@/types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Helper function to get URL type for debugging without exposing full URL
  const getUrlType = (url: string): string => {
    if (url.startsWith('blob:')) return 'blob URL';
    if (url.startsWith('data:')) return 'data URL';
    if (url.startsWith('http://') || url.startsWith('https://')) return 'remote URL';
    return 'file path';
  };

  // Debug log on component mount
  useEffect(() => {
    console.log('[AnnotationOverlay] Component mounted');
    console.log('[AnnotationOverlay] Received annotationData:', {
      resumeUrlType: getUrlType(annotationData.resumeUrl),
      annotationsCount: annotationData.annotations.length,
      pageCount: annotationData.pageCount,
    });
    console.log('[AnnotationOverlay] PDF.js version:', pdfjs.version);
    console.log('[AnnotationOverlay] PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
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

  useEffect(() => {
    // Render annotations when page loads
    const timer = setTimeout(() => {
      renderAnnotationsForPage(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, annotationData.annotations]);

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

  const renderAnnotationsForPage = (pageNumber: number) => {
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

    // Clear previous annotations
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initialize rough.js
    const rc = rough.canvas(canvas);

    // Filter annotations for this page
    const pageAnnotations = annotationData.annotations.filter(
      (ann) => ann.boundingBox?.pageNumber === pageNumber
    );
    console.log('[AnnotationOverlay] Found', pageAnnotations.length, 'annotations for page', pageNumber);

    // Draw each annotation with hand-drawn effect
    pageAnnotations.forEach((annotation, index) => {
      if (!annotation.boundingBox) return;

      const { x, y, width, height } = annotation.boundingBox;
      const color = annotation.sentiment === 'positive' ? '#00FF00' : '#DC143C'; // Neon Green or Crimson Red
      
      // Animate drawing with delay
      setTimeout(() => {
        drawAnnotation(rc, annotation, x, y, width, height, color);
      }, index * 200); // Stagger animations
    });
  };

  const drawAnnotation = (
    rc: any,
    annotation: ResumeAnnotation,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    const options = {
      stroke: color,
      strokeWidth: 3,
      roughness: 2.5, // Hand-drawn messiness
      bowing: 1.5,
      fill: annotation.annotationType === 'highlight' ? color : undefined,
      fillStyle: 'solid' as const,
      fillWeight: annotation.annotationType === 'highlight' ? 0.3 : 1,
    };

    switch (annotation.annotationType) {
      case 'circle':
        // Draw rough circle around text
        rc.ellipse(
          x + width / 2,
          y + height / 2,
          width + 10,
          height + 10,
          options
        );
        break;

      case 'underline':
        // Draw messy underline
        rc.line(x, y + height + 2, x + width, y + height + 2, {
          ...options,
          roughness: 3,
        });
        break;

      case 'strikethrough':
        // Draw aggressive cross-out
        rc.line(x, y + height / 2, x + width, y + height / 2, {
          ...options,
          strokeWidth: 4,
          roughness: 3.5,
        });
        // Add second line for emphasis
        rc.line(x, y + height / 2 + 3, x + width, y + height / 2 + 3, {
          ...options,
          strokeWidth: 2,
          roughness: 4,
        });
        break;

      case 'highlight':
        // Draw rough rectangle highlight
        rc.rectangle(x - 2, y - 2, width + 4, height + 4, {
          ...options,
          fill: color,
          fillStyle: 'hachure' as const,
          fillWeight: 0.5,
        });
        break;
    }
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
          <div className="relative inline-block">
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
                onLoadSuccess={() => {
                  console.log('[AnnotationOverlay] Page', currentPage, 'loaded successfully');
                  // Setup canvas for annotations
                  const pageElement = document.querySelector('.react-pdf__Page');
                  if (pageElement) {
                    const rect = pageElement.getBoundingClientRect();
                    console.log('[AnnotationOverlay] Page element dimensions:', rect.width, 'x', rect.height);
                    const canvas = canvasRefs.current.get(currentPage);
                    if (canvas) {
                      canvas.width = rect.width;
                      canvas.height = rect.height;
                      console.log('[AnnotationOverlay] Canvas setup complete for page', currentPage);
                    }
                  }
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
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Page Navigation */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="brutal-btn-pink disabled:opacity-50 text-sm md:text-base px-4 md:px-8 py-3 md:py-4"
              >
                ← PREV
              </button>
              <span className="font-black text-base md:text-xl">
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
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
