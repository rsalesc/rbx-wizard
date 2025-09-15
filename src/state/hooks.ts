import { useRecoilState, useRecoilValue } from 'recoil';
import { useCallback } from 'react';
import { columnsState, columnSizesState } from './atoms';
import {
  columnByIdSelector,
  statementsSelector,
  statementCodeSelector,
  codeTemplateSelector,
  statementColumnConfigSelector,
  codeEditorColumnConfigSelector,
  statementContentSelector,
} from './selectors';
import { ColumnConfig } from './types';
import { CodeTemplateType } from '../api/services/codeTemplates';

// Hook to manage columns
export const useColumns = () => {
  const [columns, setColumns] = useRecoilState(columnsState);
  const [columnSizes, setColumnSizes] = useRecoilState(columnSizesState);

  const addColumn = useCallback(
    (column: ColumnConfig) => {
      setColumns((prev) => [...prev, column]);
    },
    [setColumns]
  );

  const removeColumn = useCallback(
    (columnId: string) => {
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    },
    [setColumns]
  );

  const updateColumnOrder = useCallback(
    (newOrder: string[]) => {
      setColumns((prev) => {
        const columnMap = new Map(prev.map((col) => [col.id, col]));
        return newOrder.map((id) => columnMap.get(id)!).filter(Boolean);
      });
    },
    [setColumns]
  );

  return {
    columns,
    columnSizes,
    setColumnSizes,
    addColumn,
    removeColumn,
    updateColumnOrder,
  };
};

// Hook to manage a specific column
export const useColumn = (columnId: string) => {
  const [column, setColumn] = useRecoilState(columnByIdSelector(columnId));

  const updateConfig = useCallback(
    (configUpdate: Partial<ColumnConfig['config']> | ((prevConfig: ColumnConfig['config']) => Partial<ColumnConfig['config']>)) => {
      setColumn((prevColumn) => {
        if (!prevColumn) return prevColumn;
        
        const newConfigUpdate = typeof configUpdate === 'function' 
          ? configUpdate(prevColumn.config)
          : configUpdate;
        
        return {
          ...prevColumn,
          config: {
            ...prevColumn.config,
            ...newConfigUpdate,
          },
        } as ColumnConfig;
      });
    },
    [setColumn]
  );

  return {
    column,
    updateConfig,
  };
};

// Hook for statement column functionality
export const useStatementColumn = (columnId: string) => {
  const statements = useRecoilValue(statementsSelector);
  const config = useRecoilValue(statementColumnConfigSelector(columnId));
  const content = useRecoilValue(statementContentSelector(columnId));
  const { updateConfig } = useColumn(columnId);

  const selectStatement = useCallback(
    (statementId: string) => {
      updateConfig({ selectedStatementId: statementId });
    },
    [updateConfig]
  );

  const toggleViewMode = useCallback(() => {
    if (!config) return;
    updateConfig({ viewMode: config.viewMode === 'pdf' ? 'code' : 'pdf' });
  }, [config, updateConfig]);

  return {
    statements,
    selectedStatementId: config?.selectedStatementId || null,
    viewMode: config?.viewMode || 'pdf',
    content,
    selectStatement,
    toggleViewMode,
  };
};

// Hook for code editor column functionality
export const useCodeEditorColumn = (columnId: string) => {
  const config = useRecoilValue(codeEditorColumnConfigSelector(columnId));
  const { updateConfig } = useColumn(columnId);

  // Get the template code when template type changes
  const templateCode = useRecoilValue(
    codeTemplateSelector(config?.templateType || 'validator')
  );

  const setCode = useCallback(
    (code: string) => {
      updateConfig({ code });
    },
    [updateConfig]
  );

  const selectTemplate = useCallback(
    async (templateType: CodeTemplateType) => {
      updateConfig({ templateType });
      
      // The template code will be automatically fetched via the selector
      // and can be used to update the code
    },
    [updateConfig]
  );

  const updateTitle = useCallback(
    (title: string) => {
      updateConfig({ title });
    },
    [updateConfig]
  );

  return {
    code: config?.code || '',
    templateType: config?.templateType || 'validator',
    language: config?.language || 'cpp',
    title: config?.title || 'Code Editor',
    templateCode,
    setCode,
    selectTemplate,
    updateTitle,
  };
};

// Hook to get all available statements
export const useStatementsList = () => {
  return useRecoilValue(statementsSelector);
};

// Hook to get statement code
export const useStatementCode = (statementId: string | null) => {
  return useRecoilValue(statementCodeSelector(statementId));
};

// Hook to get code template
export const useCodeTemplate = (templateType: CodeTemplateType) => {
  return useRecoilValue(codeTemplateSelector(templateType));
};
