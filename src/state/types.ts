import { CodeTemplateType } from '../api/services/codeTemplates';

// Column types
export type ColumnType = 'statement' | 'code-editor' | 'assistant';

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

// Assistant column configuration
export type AssistantMode = 'full-review' | 'validator-review' | 'statement-review' | null;

// Review results for both full and statement reviews are markdown strings
export type ReviewResults = string;

export interface AssistantColumnConfig extends BaseColumn {
  type: 'assistant';
  config: {
    selectedModel: string;
    assistantMode: AssistantMode;
    reviewResults: ReviewResults | null;
    isLoading: boolean;
  };
}

// Union type for all column configurations
export type ColumnConfig = StatementColumnConfig | CodeEditorColumnConfig | AssistantColumnConfig;

// Application state
export interface AppState {
  columns: ColumnConfig[];
  columnSizes: number[]; // Persisted column sizes
}

// Persistence keys
export const PERSISTENCE_KEYS = {
  APP_STATE: 'rbx-wizard-app-state',
} as const;
