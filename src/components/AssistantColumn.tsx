import React, { useState, useEffect } from 'react';
import { useColumn, useColumns } from '../state/hooks';
import { AssistantColumnConfig } from '../state/types';
import { Button } from './common/Button';
import { llmService, ReviewRequest, StatementLanguageReviewRequest, statementsService, codeTemplatesService } from '../api';
import { useRecoilValue } from 'recoil';
import { columnsState } from '../state/atoms';
import { statementsSelector } from '../state/selectors';
import FullReview from './assistant/FullReview';
import { StatementReview } from './assistant';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AssistantColumnProps {
  columnId: string;
  className?: string;
  isDraggable?: boolean;
}

const AssistantColumn: React.FC<AssistantColumnProps> = ({
  columnId,
  className = '',
  isDraggable = false,
}) => {
  const { column, updateConfig } = useColumn(columnId);
  const { columns: allColumns, removeColumn } = useColumns();
  const columns = useRecoilValue(columnsState);
  const statements = useRecoilValue(statementsSelector);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
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
  
  const canRemove = allColumns.length > 1;

  // Fetch available models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await llmService.getModels();
        setAvailableModels(response.models);
      } catch (err) {
        console.error('Failed to fetch models:', err);
        // Use fallback models if API fails
        setAvailableModels(['gpt-4o', 'claude-3', 'llama-3']);
      }
    };
    
    fetchModels();
  }, []);

  if (!column || column.type !== 'assistant') {
    return null;
  }

  const config = (column as AssistantColumnConfig).config;

  const handleModelChange = (modelId: string) => {
    updateConfig({ selectedModel: modelId });
    setShowModelDropdown(false);
  };

  const handleStatementReview = async () => {
    // Clear any previous errors
    setError(null);
    
    // Find all statement columns
    const statementColumns = columns.filter(col => col.type === 'statement');
    
    if (statementColumns.length === 0) {
      setError('No statement columns are open. Please open a statement first.');
      return;
    }

    // Get unique selected statement IDs
    const selectedStatementIds = [...new Set(
      statementColumns
        .map(col => col.type === 'statement' ? col.config.selectedStatementId : null)
        .filter((id): id is string => id !== null)
    )];

    if (selectedStatementIds.length === 0) {
      setError('No statements are selected. Please select a statement in one of the statement columns.');
      return;
    }

    if (selectedStatementIds.length > 1) {
      setError('Multiple different statements are selected. Please ensure only one statement is selected across all columns.');
      return;
    }

    // Get the statement content - we'll need to fetch it from the API
    updateConfig({ assistantMode: 'statement-review', isLoading: true });

    try {
      const statementId = selectedStatementIds[0];
      
      // Find the statement to get its language
      const statement = statements.find(s => s.name === statementId);
      if (!statement) {
        setError('Statement not found in the statements list.');
        updateConfig({ isLoading: false });
        return;
      }
      
      // Fetch statement code from the API
      const statementCodeResponse = await statementsService.getStatementCode(statementId);
      
      // Validate response
      if (!statementCodeResponse || !statementCodeResponse.code) {
        setError('Failed to fetch statement content.');
        updateConfig({ isLoading: false });
        return;
      }

      const reviewRequest: StatementLanguageReviewRequest = {
        statement: statementCodeResponse.code,
        language: statement.language,
        model: config.selectedModel,
      };

      const response = await llmService.reviewStatementLanguage(reviewRequest);
      
      updateConfig({
        reviewResults: response,
        isLoading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while reviewing the statement';
      console.error('Statement review error:', err);
      setError(errorMessage);
      updateConfig({ isLoading: false });
    }
  };

  const handleFullReview = async () => {
    // Clear any previous errors
    setError(null);
    
    // Find all statement columns
    const statementColumns = columns.filter(col => col.type === 'statement');
    
    if (statementColumns.length === 0) {
      setError('No statement columns are open. Please open a statement first.');
      return;
    }

    // Get unique selected statement IDs
    const selectedStatementIds = [...new Set(
      statementColumns
        .map(col => col.type === 'statement' ? col.config.selectedStatementId : null)
        .filter((id): id is string => id !== null)
    )];

    if (selectedStatementIds.length === 0) {
      setError('No statements are selected. Please select a statement in one of the statement columns.');
      return;
    }

    if (selectedStatementIds.length > 1) {
      setError('Multiple different statements are selected. Please ensure only one statement is selected across all columns.');
      return;
    }

    // Get the statement content - we'll need to fetch it from the API
    updateConfig({ assistantMode: 'full-review', isLoading: true });

    try {
      const statementId = selectedStatementIds[0];
      
      // Find the statement to get its language
      const statement = statements.find(s => s.name === statementId);
      if (!statement) {
        setError('Statement not found in the statements list.');
        updateConfig({ isLoading: false });
        return;
      }
      
      // Fetch statement and validator first
      const [statementCodeResponse, validatorResponse] = await Promise.all([
        statementsService.getStatementCode(statementId),
        codeTemplatesService.getValidator()
      ]);
      
      // Validate responses
      if (!statementCodeResponse || !statementCodeResponse.code) {
        setError('Failed to fetch statement content.');
        updateConfig({ isLoading: false });
        return;
      }

      if (!validatorResponse || !validatorResponse.code) {
        setError('Failed to fetch validator code.');
        updateConfig({ isLoading: false });
        return;
      }

      // Build review request based on whether it's interactive or not
      const reviewRequest: ReviewRequest = {
        statement: statementCodeResponse.code,
        language: statement.language,
        validator: validatorResponse.code,
        model: config.selectedModel,
      };

      // Try to fetch interactor first to determine if it's an interactive problem
      let isInteractive = false;
      try {
        const interactorResponse = await codeTemplatesService.getInteractor();
        if (interactorResponse && interactorResponse.code) {
          reviewRequest.interactor = interactorResponse.code;
          isInteractive = true;
        }
      } catch (interactorError) {
        // Interactor not found - this is expected for non-interactive problems
        console.log('Interactor not found, assuming non-interactive problem');
      }

      // If it's not interactive, fetch the checker
      if (!isInteractive) {
        try {
          const checkerResponse = await codeTemplatesService.getChecker();
          if (!checkerResponse || !checkerResponse.code) {
            setError('Failed to fetch checker code.');
            updateConfig({ isLoading: false });
            return;
          }
          reviewRequest.checker = checkerResponse.code;
        } catch (checkerError) {
          setError('Failed to fetch checker code. Make sure a checker is available for non-interactive problems.');
          updateConfig({ isLoading: false });
          return;
        }
      }

      const response = await llmService.reviewStatement(reviewRequest);
      
      updateConfig({
        reviewResults: response,
        isLoading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while reviewing the statement';
      console.error('Review error:', err);
      setError(errorMessage);
      updateConfig({ isLoading: false });
    }
  };


  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {/* Header with controls - matching other columns */}
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
          <h2 className="text-sm font-medium text-gray-700">AI Assistant</h2>
          
          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
            >
              <span>{config.selectedModel || 'Select Model'}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showModelDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
            
            {showModelDropdown && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {availableModels.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">Loading models...</div>
                ) : (
                  availableModels.map(model => (
                    <button
                      key={model}
                      onClick={() => handleModelChange(model)}
                      className="block w-full px-3 py-2 text-xs text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                    >
                      {model}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons and remove button */}
        <div className="flex items-center space-x-3">
          {config.assistantMode && (
            <button
              onClick={() => {
                updateConfig({ assistantMode: null, reviewResults: null });
                setError(null);
              }}
              className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Back to review options"
            >
              Back
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {!config.assistantMode && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Select an assistant mode to get started.
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleFullReview}
                className="w-full"
                variant="primary"
              >
                Full Review
              </Button>
              <Button
                onClick={() => {/* TODO: Implement validator review */}}
                className="w-full"
                variant="secondary"
                disabled
              >
                Validator Review (Coming Soon)
              </Button>
              <Button
                onClick={handleStatementReview}
                className="w-full"
                variant="secondary"
              >
                Statement Review
              </Button>
            </div>
          </div>
        )}

        {config.assistantMode === 'full-review' && (
          <FullReview
            isLoading={config.isLoading}
            error={error}
            reviewResults={config.reviewResults}
            onReview={handleFullReview}
          />
        )}

        {config.assistantMode === 'statement-review' && (
          <StatementReview
            isLoading={config.isLoading}
            error={error}
            reviewResults={config.reviewResults}
            onReview={handleStatementReview}
          />
        )}
      </div>
    </div>
  );
};

export default AssistantColumn;
