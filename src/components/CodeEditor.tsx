import React from 'react';
import Editor from '@monaco-editor/react';
import { registerSimpleLatexLanguage } from '../utils/monacoLatexSimple';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  options?: {
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

// Track if LaTeX has been initialized
let latexInitialized = false;

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language = 'javascript',
  className = '',
  theme = 'vs-light',
  options = {}
}) => {
  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 12,
    lineNumbers: 'on' as const,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    readOnly: false,
    domReadOnly: false,
    wordWrap: 'on' as const,
    ...options
  };

  return (
    <div className={`h-full ${className}`}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme={theme}
        options={defaultOptions}
        beforeMount={(monaco) => {
          // Ensure LaTeX is registered only once
          if (!latexInitialized) {
            try {
              registerSimpleLatexLanguage(monaco);
              latexInitialized = true;
              console.log('LaTeX support initialized successfully');
            } catch (error) {
              console.error('Error initializing LaTeX support:', error);
            }
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
