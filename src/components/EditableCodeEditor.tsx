import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { editorSaveMetaState } from '../state/atoms';
import CodeEditor from './CodeEditor';
import { LoadingSpinner } from './common/LoadingSpinner';

interface EditableCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onSave?: (code: string) => Promise<void>;
  language?: string;
  className?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  editorOptions?: {
    minimap?: { enabled: boolean };
    fontSize?: number;
    lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
    automaticLayout?: boolean;
    padding?: { top?: number; bottom?: number };
    wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
    scrollBeyondLastLine?: boolean;
  };
  debounceMs?: number;
  sharedStatusKey?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const EditableCodeEditor: React.FC<EditableCodeEditorProps> = ({
  code,
  onChange,
  onSave,
  language = 'javascript',
  className = '',
  theme = 'vs-light',
  editorOptions = {},
  debounceMs = 1000,
  sharedStatusKey,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  const currentCodeRef = useRef<string>(code);
  const localKeyRef = useRef<string>(`__local__:${Math.random().toString(36).slice(2)}`);
  const [sharedMeta, setSharedMeta] = useRecoilState(
    editorSaveMetaState(sharedStatusKey || localKeyRef.current)
  );

  // Update current code ref whenever code changes
  useEffect(() => {
    currentCodeRef.current = code;
  }, [code]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Initialize last saved code only once when component mounts
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('EditableCodeEditor: Initializing with code', { code });
      lastSavedCodeRef.current = code;
      isInitializedRef.current = true;
    }
  }, [code]);

  // Keep UI state in sync with shared meta
  useEffect(() => {
    setSaveStatus(sharedMeta.status as SaveStatus);
    setIsDirty(sharedMeta.isDirty);
    setLastSavedAt(sharedMeta.lastSavedAt ? new Date(sharedMeta.lastSavedAt) : null);
    // If another instance saved, align our lastSavedCodeRef to current code to prevent redundant saves
    if (sharedMeta.status === 'saved') {
      lastSavedCodeRef.current = currentCodeRef.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMeta]);

  const handleSave = useCallback(async (codeToSave: string) => {
    console.log('EditableCodeEditor: handleSave called', { hasOnSave: !!onSave, codeToSave });
    if (!onSave) return;

    // Don't save if the code hasn't changed from the last saved version
    if (codeToSave === lastSavedCodeRef.current) {
      console.log('EditableCodeEditor: Code unchanged, skipping save');
      return;
    }

    setSaveStatus('saving');
    setSharedMeta((prev) => ({ ...prev, status: 'saving' }));
    try {
      console.log('EditableCodeEditor: Calling onSave');
      await onSave(codeToSave);
      const now = new Date();
      setSaveStatus('saved');
      setLastSavedAt(now);
      lastSavedCodeRef.current = codeToSave;
      setIsDirty(false);
      setSharedMeta({ status: 'saved', isDirty: false, lastSavedAt: now.getTime() });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSharedMeta((prev) => ({ ...prev, status: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error('Failed to save code:', error);
      setSaveStatus('error');
      setSharedMeta((prev) => ({ ...prev, status: 'error' }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSharedMeta((prev) => ({ ...prev, status: 'idle' }));
      }, 3000);
    }
  }, [onSave]);

  const handleCodeChange = useCallback((newCode: string) => {
    console.log('EditableCodeEditor: handleCodeChange called', { 
      isEditable, 
      hasOnSave: !!onSave,
      codeChanged: newCode !== lastSavedCodeRef.current,
      lastSaved: lastSavedCodeRef.current.substring(0, 50) + '...',
      newCode: newCode.substring(0, 50) + '...'
    });
    onChange(newCode);
    
    // Check if code has actually changed from last saved version
    if (newCode !== lastSavedCodeRef.current) {
      setIsDirty(true);
      setSharedMeta((prev) => ({ ...prev, isDirty: true }));
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      if (isEditable && onSave) {
        console.log('EditableCodeEditor: Setting save timeout');
        saveTimeoutRef.current = setTimeout(() => {
          console.log('EditableCodeEditor: Timeout triggered, calling handleSave');
          handleSave(newCode);
        }, debounceMs);
      }
    } else {
      setIsDirty(false);
      setSharedMeta((prev) => ({ ...prev, isDirty: false }));
    }
  }, [onChange, isEditable, onSave, handleSave, debounceMs]);

  const toggleEditMode = () => {
    setIsEditable(!isEditable);
    if (!isEditable) {
      // Entering edit mode
      setIsDirty(currentCodeRef.current !== lastSavedCodeRef.current);
      setSaveStatus('idle');
      setSharedMeta((prev) => ({ ...prev, status: 'idle', isDirty: currentCodeRef.current !== lastSavedCodeRef.current }));
    } else {
      // Leaving edit mode - save immediately if dirty
      if (isDirty && onSave) {
        handleSave(currentCodeRef.current);
      }
    }
  };

  const formatLastSaved = () => {
    if (!lastSavedAt) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSavedAt.toLocaleDateString();
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return `Saved ${formatLastSaved()}`;
      case 'error':
        return 'Failed to save';
      default:
        return isDirty ? 'Unsaved changes' : '';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Edit mode toggle button */}
      <div className="flex justify-end px-2 py-0.5 bg-gray-50 border-b border-gray-200">
        <button
          onClick={toggleEditMode}
          className={`
            px-2.5 py-0.5 text-[10px] font-medium rounded-md transition-colors
            ${isEditable 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
          title={isEditable ? 'Switch to read-only mode' : 'Switch to edit mode'}
        >
          {isEditable ? (
            <>
              <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Mode
            </>
          ) : (
            <>
              <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Read-Only
            </>
          )}
        </button>
      </div>

      {/* Code editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={language}
          theme={theme}
          options={{
            ...editorOptions,
            readOnly: !isEditable,
          }}
        />
      </div>

      {/* Status bar */}
      {onSave && (
        <div className="px-2 py-0.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600">
            {saveStatus === 'saving' && (
              <div className="flex items-center">
                <LoadingSpinner className="w-3 h-3 mr-1.5" />
                <span>{getStatusMessage()}</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center text-green-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{getStatusMessage()}</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{getStatusMessage()}</span>
              </div>
            )}
            {saveStatus === 'idle' && isDirty && (
              <div className="flex items-center text-amber-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{getStatusMessage()}</span>
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-gray-500">
            {isEditable ? 'Auto-save enabled' : 'Read-only mode'}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableCodeEditor;
