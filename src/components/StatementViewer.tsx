import React, { useEffect, useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useStatementColumn, useColumns } from '../state/hooks';
import PDFViewer from './PDFViewer';
import EditableCodeEditor from './EditableCodeEditor';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { statementsService } from '../api/services/statements';
import { statementCodeTextState, statementPdfVersionState, statementBuildingState } from '../state/atoms';

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
  
  // Shared statement code state across viewers
  const statementKey = selectedStatementId || '__none__';
  const [sharedCode, setSharedCode] = useRecoilState(statementCodeTextState(statementKey));
  const bumpPdfVersion = useSetRecoilState(statementPdfVersionState(statementKey));
  const [isBuilding, setIsBuilding] = useRecoilState(statementBuildingState(statementKey));

  // Initialize shared code from API response on first load for this statement
  React.useEffect(() => {
    if (content.type === 'code' && content.content) {
      const apiCode = (content.content as any).code || '';
      if (sharedCode === '' && apiCode !== '') {
        setSharedCode(apiCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, selectedStatementId]);
  
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
  // Also validate that selectedStatementId exists in the current statements list
  useEffect(() => {
    if (statements && statements.length > 0) {
      console.log('Available statements:', statements.map(s => s.name));
      console.log('Current selectedStatementId:', selectedStatementId);
      
      // If no statement is selected, select the first one
      if (!selectedStatementId) {
        console.log('No statement selected, selecting first:', statements[0].name);
        selectStatement(statements[0].name);
      } else {
        // Validate that the selected statement still exists
        const statementExists = statements.some(s => s.name === selectedStatementId);
        if (!statementExists) {
          // If the persisted statement doesn't exist, select the first one
          console.log('Selected statement does not exist, selecting first:', statements[0].name);
          selectStatement(statements[0].name);
        } else {
          console.log('Selected statement is valid:', selectedStatementId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statements]); // Only re-run when statements change

  const handleStatementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Current selectedStatementId:', selectedStatementId);
    console.log('Selecting new statement:', e.target.value);
    selectStatement(e.target.value);
  };

  const handleSaveCode = useCallback(async (codeToSave: string) => {
    console.log(`StatementViewer: Saving code for statement ${selectedStatementId}`, { codeToSave });
    if (!selectedStatementId) {
      throw new Error('No statement selected');
    }
    
    try {
      const result = await statementsService.saveStatementCode(selectedStatementId, codeToSave);
      console.log(`Successfully saved code for statement: ${selectedStatementId}`, result);
    } catch (error) {
      console.error(`Failed to save code for statement ${selectedStatementId}:`, error);
      throw error; // Re-throw to let EditableCodeEditor handle the error state
    }
  }, [selectedStatementId]);

  const handleRebuildPdf = useCallback(async () => {
    if (!selectedStatementId) return;
    try {
      setIsBuilding(true);
      await statementsService.buildStatement(selectedStatementId);
      // Bump shared PDF version so all viewers refresh
      bumpPdfVersion((v) => v + 1);
    } catch (error) {
      console.error('Failed to rebuild statement PDF:', error);
    } finally {
      setIsBuilding(false);
    }
  }, [selectedStatementId, bumpPdfVersion]);

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
        className={`border-b border-gray-200 px-3 py-2 flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
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
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </button>
          )}
          <h2 className="text-sm font-medium text-gray-700">Statement</h2>
          
          {/* Statement dropdown */}
          <select
            value={selectedStatementId || ''}
            onChange={handleStatementChange}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statements.map(statement => (
              <option key={statement.name} value={statement.name}>
                {statement.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* View mode toggle, rebuild (PDF) and remove button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
          <span className={`text-xs ${viewMode === 'pdf' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            PDF
          </span>
          <button
            onClick={toggleViewMode}
            className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="switch"
            aria-checked={viewMode === 'code'}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                viewMode === 'code' ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
            <span className={`text-xs ${viewMode === 'code' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Code
            </span>
          </div>

          {viewMode === 'pdf' && (
            <button
              onClick={handleRebuildPdf}
              disabled={!selectedStatementId || isBuilding}
              className={`px-2 py-1 text-xs rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${isBuilding ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              title="Rebuild statement PDF"
              type="button"
            >
              {isBuilding ? 'Rebuilding…' : 'Rebuild'}
            </button>
          )}
          
          {canRemove && (
            <button
              onClick={() => removeColumn(columnId)}
              className="text-gray-400 hover:text-red-600 focus:outline-none"
              title="Remove column"
            >
              <svg
                className="w-3.5 h-3.5"
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
          <EditableCodeEditor
            code={sharedCode}
            onChange={setSharedCode}
            onSave={handleSaveCode}
            language={(content.content as any).language || 'plaintext'}
            className="h-full"
            sharedStatusKey={selectedStatementId ? `statement:${selectedStatementId}` : undefined}
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
