import { atom, atomFamily } from 'recoil';
import { ColumnConfig, PERSISTENCE_KEYS } from './types';

// Helper to load state from localStorage
const loadPersistedState = <T>(key: string, defaultValue: T): T => {
  try {
    const savedState = localStorage.getItem(key);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
  }
  return defaultValue;
};

// Default columns configuration
const defaultColumns: ColumnConfig[] = [
  {
    id: 'statement-viewer',
    type: 'statement',
    config: {
      selectedStatementId: null,
      viewMode: 'pdf',
    },
    minSize: 15,
    maxSize: 50,
    defaultSize: 30,
  },
  {
    id: 'validator-editor',
    type: 'code-editor',
    config: {
      templateType: 'validator',
      code: '',
      language: 'cpp',
      title: 'Validator',
    },
    minSize: 20,
    maxSize: 60,
    defaultSize: 35,
  },
  {
    id: 'checker-editor',
    type: 'code-editor',
    config: {
      templateType: 'checker',
      code: '',
      language: 'cpp',
      title: 'Checker',
    },
    minSize: 20,
    maxSize: 60,
    defaultSize: 35,
  },
];

// Main columns atom - manages the list of columns and their configurations
export const columnsState = atom<ColumnConfig[]>({
  key: 'columnsState',
  default: loadPersistedState(PERSISTENCE_KEYS.APP_STATE, { columns: defaultColumns }).columns || defaultColumns,
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        // Persist to localStorage whenever columns change
        const currentState = localStorage.getItem(PERSISTENCE_KEYS.APP_STATE);
        const parsedState = currentState ? JSON.parse(currentState) : {};
        localStorage.setItem(
          PERSISTENCE_KEYS.APP_STATE,
          JSON.stringify({
            ...parsedState,
            columns: newValue,
          })
        );
      });
    },
  ],
});

// Column sizes atom - manages the resizable panel sizes
export const columnSizesState = atom<number[]>({
  key: 'columnSizesState',
  default: loadPersistedState(PERSISTENCE_KEYS.APP_STATE, { columnSizes: [] }).columnSizes || [],
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        // Persist to localStorage whenever sizes change
        const currentState = localStorage.getItem(PERSISTENCE_KEYS.APP_STATE);
        const parsedState = currentState ? JSON.parse(currentState) : {};
        localStorage.setItem(
          PERSISTENCE_KEYS.APP_STATE,
          JSON.stringify({
            ...parsedState,
            columnSizes: newValue,
          })
        );
      });
    },
  ],
});

// Shared code state by template type (keeps multiple editors in sync)
export const templateCodeTextState = atomFamily<string, import('../api/services/codeTemplates').CodeTemplateType>({
  key: 'templateCodeTextState',
  default: '',
});

// Shared statement code state by statement id (sync across statement viewers in code mode)
export const statementCodeTextState = atomFamily<string, string>({
  key: 'statementCodeTextState',
  default: '',
});

// PDF version token per statement id to force refresh across viewers when rebuilt
export const statementPdfVersionState = atomFamily<number, string>({
  key: 'statementPdfVersionState',
  default: 0,
});

// Shared save status metadata for editors (code templates and statements)
// Key format suggestion: `template:validator` or `statement:<id>`
export type EditorSharedStatus = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  isDirty: boolean;
  lastSavedAt: number | null; // epoch ms
};

export const editorSaveMetaState = atomFamily<EditorSharedStatus, string>({
  key: 'editorSaveMetaState',
  default: {
    status: 'idle',
    isDirty: false,
    lastSavedAt: null,
  },
});

// Shared building state for statements
export const statementBuildingState = atomFamily<boolean, string>({
  key: 'statementBuildingState',
  default: false,
});
