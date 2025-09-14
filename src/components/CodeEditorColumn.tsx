import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { CodeTemplateType } from '../api/services/codeTemplates';
import { useCodeTemplatesManager } from '../hooks';

interface CodeEditorColumnProps {
  initialTemplate?: CodeTemplateType;
  title?: string;
  language?: string;
  className?: string;
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
  initialTemplate = 'validator',
  title = 'Code Editor',
  language = 'cpp',
  className = '',
  editorOptions = {}
}) => {
  const [code, setCode] = useState(`// Welcome to the code editor!
// Select a template from the dropdown to load code
// You can also write your own code here

function hello() {
  console.log("Hello, World!");
}

hello();`);
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplateType>(initialTemplate);
  const [currentTitle, setCurrentTitle] = useState(title);
  
  const { 
    selectedType,
    selectTemplate, 
    getSelectedCode,
    loading,
    error 
  } = useCodeTemplatesManager();

  // Handle template selection
  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as CodeTemplateType;
    setSelectedTemplate(type);
    await selectTemplate(type);
  };

  // Update title when template changes
  useEffect(() => {
    const templateTitles: Record<CodeTemplateType, string> = {
      validator: 'Validator',
      checker: 'Checker',
      interactor: 'Interactor'
    };
    setCurrentTitle(templateTitles[selectedTemplate]);
  }, [selectedTemplate]);

  // Fetch initial template on mount
  useEffect(() => {
    const fetchInitialTemplate = async () => {
      await selectTemplate(initialTemplate);
    };
    fetchInitialTemplate();
  }, [initialTemplate, selectTemplate]);
  
  // Update code when template is loaded
  useEffect(() => {
    const templateCode = getSelectedCode();
    if (templateCode) {
      setCode(templateCode);
    }
  }, [selectedType, getSelectedCode]);

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">{currentTitle}</h2>
        
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">Error loading template</span>
          )}
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="validator">Validator</option>
            <option value="checker">Checker</option>
            <option value="interactor">Interactor</option>
          </select>
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
