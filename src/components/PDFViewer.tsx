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
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWidthRef = useRef<number | null>(null);

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

  // Memoize the page width to prevent unnecessary re-renders
  const pageWidth = useMemo(() => {
    if (!containerWidth) return undefined;
    // Subtract padding (2 * 16px) - clientWidth already excludes scrollbar
    return containerWidth - 32;
  }, [containerWidth]);

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {showHeader && (
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          {numPages && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden flex justify-center bg-gray-50 p-4">
        <Document
          file={pdfFile}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          className="flex justify-center"
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
          <Page 
            pageNumber={pageNumber} 
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={pageWidth}
          />
        </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
