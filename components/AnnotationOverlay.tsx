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
  const [pageWidth, setPageWidth] = useState<number>(800);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);

  useEffect(() => {
    // Render annotations when page loads
    const timer = setTimeout(() => {
      renderAnnotationsForPage(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, annotationData.annotations]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const renderAnnotationsForPage = (pageNumber: number) => {
    const canvas = canvasRefs.current.get(pageNumber);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous annotations
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initialize rough.js
    const rc = rough.canvas(canvas);

    // Filter annotations for this page
    const pageAnnotations = annotationData.annotations.filter(
      (ann) => ann.boundingBox?.pageNumber === pageNumber
    );

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
        className="max-w-6xl mx-auto p-8"
      >
        {/* Header */}
        <div className="brutal-card-yellow p-6 mb-6 flex items-center justify-between transform -rotate-1">
          <div>
            <h2 className="text-4xl font-black uppercase">
              📝 LIVE RESUME MARKUP
            </h2>
            <p className="font-bold mt-2">
              See your resume through a recruiter&apos;s eyes!
            </p>
          </div>
          <button
            onClick={onClose}
            className="brutal-btn transform rotate-2"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        <div className="brutal-card p-6 relative">
          <div className="relative inline-block">
            <Document
              file={annotationData.resumeUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="border-4 border-brutal-black"
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                onLoadSuccess={() => {
                  // Setup canvas for annotations
                  const pageElement = document.querySelector('.react-pdf__Page');
                  if (pageElement) {
                    const rect = pageElement.getBoundingClientRect();
                    const canvas = canvasRefs.current.get(currentPage);
                    if (canvas) {
                      canvas.width = rect.width;
                      canvas.height = rect.height;
                    }
                  }
                }}
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
                className="brutal-btn-pink disabled:opacity-50"
              >
                ← PREV
              </button>
              <span className="font-black text-xl">
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="brutal-btn-pink disabled:opacity-50"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>

        {/* Annotation Details */}
        <div className="brutal-card-cyan p-6 mt-6 transform rotate-1">
          <h3 className="text-2xl font-black uppercase mb-4">
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
