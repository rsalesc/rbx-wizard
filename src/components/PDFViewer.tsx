import React, { useState, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  pdfFile: string;
  title?: string;
  className?: string;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  showHeader?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfFile, 
  title = 'PDF Viewer',
  className = '',
  onLoadSuccess,
  onLoadError,
  showHeader = true
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWidthRef = useRef<number | null>(null);

  // Reset when PDF file changes
  React.useEffect(() => {
    setNumPages(null);
    setScale(1);
  }, [pdfFile]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Initial measurement - use clientWidth to exclude scrollbar
    const initialWidth = containerRef.current.clientWidth;
    setContainerWidth(initialWidth);
    lastWidthRef.current = initialWidth;

    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce resize updates
      resizeTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          // Use clientWidth instead of contentRect to exclude scrollbar
          const width = containerRef.current.clientWidth;
          // Only update if width actually changed by more than 1 pixel
          if (lastWidthRef.current === null || Math.abs(width - lastWidthRef.current) > 1) {
            lastWidthRef.current = width;
            setContainerWidth(width);
          }
        }
      }, 100); // 100ms debounce
    });

    resizeObserver.observe(containerRef.current);

    // Also handle window resize for completeness
    const handleWindowResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        if (lastWidthRef.current === null || Math.abs(newWidth - lastWidthRef.current) > 1) {
          lastWidthRef.current = newWidth;
          setContainerWidth(newWidth);
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onLoadSuccess?.(numPages);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    onLoadError?.(error);
  };

  // Memoized options passed to PDF.js to disable caching
  const documentOptions = useMemo(() => ({
    httpHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  }), []);

  // Memoize the page width to prevent unnecessary re-renders
  const pageWidth = useMemo(() => {
    if (!containerWidth) return undefined;
    // Subtract padding (2 * 16px) - clientWidth already excludes scrollbar
    return containerWidth - 32;
  }, [containerWidth]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1);
  };

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {showHeader && (
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          {numPages && (
            <span className="text-sm text-gray-600">
              {numPages} page{numPages > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden relative">
        <div ref={containerRef} className="h-full overflow-y-auto overflow-x-auto flex justify-center bg-gray-50 p-4">
          <Document
            file={pdfFile}
            options={documentOptions}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            className="flex flex-col items-center space-y-4"
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading PDF...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center p-8">
                  <p className="text-lg mb-2">Failed to load PDF</p>
                  <p className="text-sm">Please check if the file exists and is a valid PDF</p>
                </div>
              </div>
            }
            noData={
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center p-8">
                  <p className="text-lg mb-2">No PDF loaded</p>
                  <p className="text-sm">Please provide a PDF file to display</p>
                </div>
              </div>
            }
          >
            {numPages && Array.from({ length: numPages }, (_, i) => (
              <Page 
                key={`page_${i + 1}`}
                pageNumber={i + 1} 
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={pageWidth}
                scale={scale}
              />
            ))}
          </Document>
        </div>
        
        {/* Zoom Controls - Floating Block */}
        <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 border border-gray-200 z-10">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer select-none"
            title="Zoom Out"
            type="button"
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer select-none"
            title="Reset Zoom"
            type="button"
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer select-none"
            title="Zoom In"
            type="button"
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
