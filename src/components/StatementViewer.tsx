import React, { useEffect } from 'react';
import { useStatementColumn, useColumns } from '../state/hooks';
import PDFViewer from './PDFViewer';
import CodeEditor from './CodeEditor';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StatementViewerProps {
  columnId: string;
  className?: string;
  isDraggable?: boolean;
}

const StatementViewer: React.FC<StatementViewerProps> = ({ 
  columnId,
  className = '',
  isDraggable = false
}) => {
  const {
    statements,
    selectedStatementId,
    viewMode,
    content,
    selectStatement,
    toggleViewMode,
  } = useStatementColumn(columnId);
  
  const { columns, removeColumn } = useColumns();
  const canRemove = columns.length > 1;
  
  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: columnId,
    disabled: !isDraggable
  });

  const style = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : {};

  // Set initial selected statement when statements are loaded
  useEffect(() => {
    if (statements && statements.length > 0 && !selectedStatementId) {
      selectStatement(statements[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statements]); // Only re-run when statements change

  const handleStatementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectStatement(e.target.value);
  };

  // Handle loading states
  if (!statements) {
    return (
      <div className={`bg-white flex items-center justify-center h-full ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className={`bg-white flex items-center justify-center h-full ${className}`}>
        <div className="text-gray-500">No statements available</div>
      </div>
    );
  }

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {/* Header with controls */}
      <div 
        ref={isDraggable ? setNodeRef : undefined}
        style={style}
        className={`border-b border-gray-200 px-4 py-3 flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center space-x-4">
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-move text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Drag to reorder"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-700">Statement Viewer</h2>
          
          {/* Statement dropdown */}
          <select
            value={selectedStatementId || ''}
            onChange={handleStatementChange}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statements.map(statement => (
              <option key={statement.name} value={statement.name}>
                {statement.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* View mode toggle and remove button */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
          <span className={`text-sm ${viewMode === 'pdf' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            PDF
          </span>
          <button
            onClick={toggleViewMode}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="switch"
            aria-checked={viewMode === 'code'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                viewMode === 'code' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
            <span className={`text-sm ${viewMode === 'code' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Code
            </span>
          </div>
          
          {canRemove && (
            <button
              onClick={() => removeColumn(columnId)}
              className="text-gray-400 hover:text-red-600 focus:outline-none"
              title="Remove column"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {content.type === 'pdf' && content.content ? (
          <PDFViewer
            pdfFile={content.content as string}
            title=""
            className="h-full"
            showHeader={false}
          />
        ) : content.type === 'code' && content.content ? (
          <CodeEditor
            code={(content.content as any).code}
            onChange={() => {}} // Read-only
            language={(content.content as any).language || 'plaintext'}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatementViewer;
