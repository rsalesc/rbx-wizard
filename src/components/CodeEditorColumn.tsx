import React, { useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { useCodeEditorColumn, useColumns } from '../state/hooks';
import { CodeTemplateType } from '../api/services/codeTemplates';
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

  // Update code when template is selected and template code is loaded
  useEffect(() => {
    if (templateCode && templateCode.code) {
      setCode(templateCode.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCode]); // setCode is stable

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
    selectTemplate(type);
  };

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
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
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={templateType}
            onChange={handleTemplateChange}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={language}
          options={editorOptions}
        />
      </div>
    </div>
  );
};

export default CodeEditorColumn;
