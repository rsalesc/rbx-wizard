import React, { useState } from 'react';
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
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfFile, 
  title = 'PDF Viewer',
  className = '',
  onLoadSuccess,
  onLoadError
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onLoadSuccess?.(numPages);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    onLoadError?.(error);
  };

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
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
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-gray-50 p-4">
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
            width={containerWidth ? containerWidth - 32 : undefined} // Subtract padding (2 * 16px)
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
