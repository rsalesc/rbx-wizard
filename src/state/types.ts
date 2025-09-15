import { CodeTemplateType } from '../api/services/codeTemplates';

// Column types
export type ColumnType = 'statement' | 'code-editor';

// Base column configuration
export interface BaseColumn {
  id: string;
  type: ColumnType;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
}

// Statement column configuration
export interface StatementColumnConfig extends BaseColumn {
  type: 'statement';
  config: {
    selectedStatementId: string | null;
    viewMode: 'pdf' | 'code';
  };
}

// Code editor column configuration
export interface CodeEditorColumnConfig extends BaseColumn {
  type: 'code-editor';
  config: {
    templateType: CodeTemplateType;
    code: string;
    language: string;
    title: string;
  };
}

// Union type for all column configurations
export type ColumnConfig = StatementColumnConfig | CodeEditorColumnConfig;

// Application state
export interface AppState {
  columns: ColumnConfig[];
  columnSizes: number[]; // Persisted column sizes
}

// Persistence keys
export const PERSISTENCE_KEYS = {
  APP_STATE: 'rbx-wizard-app-state',
} as const;
