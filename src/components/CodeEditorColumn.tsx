import React, { useEffect, useState, useCallback } from 'react';
import EditableCodeEditor from './EditableCodeEditor';
import { useCodeEditorColumn, useColumns } from '../state/hooks';
import { CodeTemplateType, codeTemplatesService } from '../api/services/codeTemplates';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CodeEditorColumnProps {
  columnId: string;
  className?: string;
  isDraggable?: boolean;
  editorOptions?: {
    readOnly?: boolean;
    minimap?: { enabled: boolean };
    fontSize?: number;
    lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
    automaticLayout?: boolean;
    padding?: { top?: number; bottom?: number };
    wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
    scrollBeyondLastLine?: boolean;
  };
}

const CodeEditorColumn: React.FC<CodeEditorColumnProps> = ({
  columnId,
  className = '',
  isDraggable = false,
  editorOptions = {}
}) => {
  const {
    code,
    templateType,
    language,
    title,
    templateCode,
    setCode,
    selectTemplate,
    updateTitle,
  } = useCodeEditorColumn(columnId);
  
  const { columns, removeColumn } = useColumns();
  const canRemove = columns.length > 1;
  
  // Track loading state for template changes
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  
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

  // Initialize shared code from template only when it's not already set
  useEffect(() => {
    if (templateCode && templateCode.code) {
      // Only hydrate shared code if empty to avoid overwriting edits from another column
      if (!code || code.length === 0) {
        setCode(templateCode.code);
      }
      setIsLoadingTemplate(false);
    } else if (templateCode === null && isLoadingTemplate) {
      // Template failed to load
      setIsLoadingTemplate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCode, isLoadingTemplate]); // setCode is stable

  // Update title when template changes
  useEffect(() => {
    const templateTitles: Record<CodeTemplateType, string> = {
      validator: 'Validator',
      checker: 'Checker',
      interactor: 'Interactor'
    };
    updateTitle(templateTitles[templateType]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]); // updateTitle is stable

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as CodeTemplateType;
    setIsLoadingTemplate(true);
    selectTemplate(type);
  };

  const handleSaveCode = useCallback(async (codeToSave: string) => {
    console.log(`CodeEditorColumn: Saving ${templateType} code`, { codeToSave });
    try {
      const result = await codeTemplatesService.saveCodeTemplate(templateType, codeToSave);
      console.log(`Successfully saved ${templateType} code`, result);
    } catch (error) {
      console.error(`Failed to save ${templateType} code:`, error);
      throw error; // Re-throw to let EditableCodeEditor handle the error state
    }
  }, [templateType]);

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
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
          <h2 className="text-sm font-medium text-gray-700">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={templateType}
            onChange={handleTemplateChange}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="validator">Validator</option>
            <option value="checker">Checker</option>
            <option value="interactor">Interactor</option>
          </select>
          
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
      <div className="flex-1 overflow-hidden">
        {isLoadingTemplate ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : templateCode === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">Template not found</div>
              <div className="text-gray-400 text-sm">
                Unable to load the {templateType} template. Please check if the API server is running.
              </div>
            </div>
          </div>
        ) : (
          <EditableCodeEditor
            code={code}
            onChange={setCode}
            onSave={handleSaveCode}
            language={language}
            editorOptions={editorOptions}
            sharedStatusKey={`template:${templateType}`}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditorColumn;
