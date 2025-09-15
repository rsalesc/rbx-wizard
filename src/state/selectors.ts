import { selector, selectorFamily, DefaultValue } from 'recoil';
import { columnsState } from './atoms';
import { statementPdfVersionState } from './atoms';
import { ColumnConfig, CodeEditorColumnConfig, StatementColumnConfig } from './types';
import { statementsService, codeTemplatesService } from '../api';
import { Statement, CodeResponse } from '../api/types';

// Selector to get a specific column by ID
export const columnByIdSelector = selectorFamily<ColumnConfig | undefined, string>({
  key: 'columnByIdSelector',
  get: (columnId) => ({ get }) => {
    const columns = get(columnsState);
    return columns.find((col) => col.id === columnId);
  },
  set: (columnId) => ({ set, get }, newValue) => {
    if (newValue === undefined || newValue instanceof DefaultValue) return;
    
    const columns = get(columnsState);
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? newValue : col
    );
    set(columnsState, updatedColumns);
  },
});

// Selector for all available statements (cached)
export const statementsSelector = selector<Statement[]>({
  key: 'statementsSelector',
  get: async () => {
    try {
      const response = await statementsService.getStatements();
      return response;
    } catch (error) {
      console.error('Error fetching statements:', error);
      return [];
    }
  },
});

// Selector for statement code - reactive to statement ID changes
export const statementCodeSelector = selectorFamily<CodeResponse | null, string | null>({
  key: 'statementCodeSelector',
  get: (statementId) => async () => {
    if (!statementId) return null;
    
    try {
      const response = await statementsService.getStatementCode(statementId);
      return response;
    } catch (error) {
      console.error('Error fetching statement code:', error);
      return null;
    }
  },
});

// Selector for code templates - reactive to template type changes
export const codeTemplateSelector = selectorFamily<CodeResponse | null, string>({
  key: 'codeTemplateSelector',
  get: (templateType) => async () => {
    try {
      const response = await codeTemplatesService.getCodeTemplate(
        templateType as 'validator' | 'checker' | 'interactor'
      );
      return response;
    } catch (error) {
      console.error('Error fetching code template:', error);
      return null;
    }
  },
});

// Helper selector to get statement column config
export const statementColumnConfigSelector = selectorFamily<
  StatementColumnConfig['config'] | null,
  string
>({
  key: 'statementColumnConfigSelector',
  get: (columnId) => ({ get }) => {
    const column = get(columnByIdSelector(columnId));
    if (column?.type === 'statement') {
      return (column as StatementColumnConfig).config;
    }
    return null;
  },
});

// Helper selector to get code editor column config
export const codeEditorColumnConfigSelector = selectorFamily<
  CodeEditorColumnConfig['config'] | null,
  string
>({
  key: 'codeEditorColumnConfigSelector',
  get: (columnId) => ({ get }) => {
    const column = get(columnByIdSelector(columnId));
    if (column?.type === 'code-editor') {
      return (column as CodeEditorColumnConfig).config;
    }
    return null;
  },
});

// Selector to get the current statement content (PDF URL or code) based on view mode
export const statementContentSelector = selectorFamily<
  { type: 'pdf' | 'code'; content: string | CodeResponse | null },
  string
>({
  key: 'statementContentSelector',
  get: (columnId) => ({ get }) => {
    const config = get(statementColumnConfigSelector(columnId));
    if (!config || !config.selectedStatementId) {
      return { type: 'pdf', content: null };
    }

    if (config.viewMode === 'pdf') {
      const version = get(statementPdfVersionState(config.selectedStatementId));
      const pdfUrl = `http://localhost:8000/statement/${config.selectedStatementId}?v=${version}`;
      console.log('Generating PDF URL for statement:', config.selectedStatementId, '-> URL:', pdfUrl);
      return {
        type: 'pdf',
        content: pdfUrl,
      };
    } else {
      const codeData = get(statementCodeSelector(config.selectedStatementId));
      return {
        type: 'code',
        content: codeData,
      };
    }
  },
});
