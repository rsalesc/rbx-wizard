# State Management with Recoil

This directory contains the centralized state management for the RBX Wizard application using Recoil.

## Overview

The state management system provides:

1. **Centralized State**: All application state is managed in one place
2. **Persistence**: State automatically persists to localStorage
3. **Async Data Handling**: API data is fetched reactively based on dependencies
4. **Type Safety**: Full TypeScript support throughout

## Structure

### Types (`types.ts`)
Defines all the TypeScript interfaces for our state:
- `ColumnType`: 'statement' | 'code-editor'
- `ColumnConfig`: Configuration for each column including type-specific settings
- `AppState`: Overall application state structure

### Atoms (`atoms.ts`)
Contains the core state atoms:
- `columnsState`: Array of column configurations
- `columnSizesState`: Array of column sizes from the resizable panels

Both atoms automatically persist to localStorage.

### Selectors (`selectors.ts`)
Provides derived state and async data fetching:
- `columnByIdSelector`: Get/set specific column by ID
- `statementsSelector`: Fetches all available statements from API
- `statementCodeSelector`: Fetches code for a specific statement
- `codeTemplateSelector`: Fetches code template by type
- `statementContentSelector`: Returns PDF URL or code based on view mode

### Hooks (`hooks.ts`)
React hooks for easy state interaction:
- `useColumns()`: Manage all columns (add, remove, reorder)
- `useColumn(columnId)`: Manage a specific column
- `useStatementColumn(columnId)`: Statement-specific functionality
- `useCodeEditorColumn(columnId)`: Code editor-specific functionality

## Usage Examples

### Adding a New Column
```typescript
import { useColumns } from '@/state/hooks';

const MyComponent = () => {
  const { addColumn } = useColumns();
  
  const handleAddStatement = () => {
    addColumn({
      id: `statement-${Date.now()}`,
      type: 'statement',
      config: {
        selectedStatementId: null,
        viewMode: 'pdf',
      },
      minSize: 15,
      maxSize: 50,
      defaultSize: 30,
    });
  };
};
```

### Using a Statement Column
```typescript
import { useStatementColumn } from '@/state/hooks';

const StatementViewer = ({ columnId }) => {
  const {
    statements,           // All available statements
    selectedStatementId,  // Currently selected statement
    viewMode,            // 'pdf' or 'code'
    content,             // Current content (PDF URL or code)
    selectStatement,     // Function to select a statement
    toggleViewMode,      // Toggle between PDF/code view
  } = useStatementColumn(columnId);
  
  // Component logic...
};
```

### Using a Code Editor Column
```typescript
import { useCodeEditorColumn } from '@/state/hooks';

const CodeEditor = ({ columnId }) => {
  const {
    code,            // Current code content
    templateType,    // 'validator' | 'checker' | 'interactor'
    language,        // Programming language
    title,           // Column title
    templateCode,    // Template code from API
    setCode,         // Update code
    selectTemplate,  // Change template type
  } = useCodeEditorColumn(columnId);
  
  // Component logic...
};
```

## Key Features

### Automatic Persistence
All state changes are automatically saved to localStorage:
```typescript
// State is loaded on app start
const loadPersistedState = <T>(key: string, defaultValue: T): T => {
  const savedState = localStorage.getItem(key);
  return savedState ? JSON.parse(savedState) : defaultValue;
};
```

### Reactive API Data
Selectors automatically fetch data when dependencies change:
```typescript
// When selectedStatementId changes, code is automatically fetched
const statementCode = useRecoilValue(
  statementCodeSelector(selectedStatementId)
);
```

### Type-Safe Column Management
TypeScript ensures type safety when working with different column types:
```typescript
if (column.type === 'statement') {
  // TypeScript knows this is a StatementColumnConfig
  const { selectedStatementId, viewMode } = column.config;
}
```

## Adding New Column Types

To add a new column type:

1. Add the type to `ColumnType` in `types.ts`
2. Create a new interface extending `BaseColumn`
3. Add to the `ColumnConfig` union type
4. Create corresponding hooks in `hooks.ts`
5. Implement the component using the hooks

## Performance Considerations

- Selectors cache their results automatically
- API calls are deduplicated by Recoil
- Use `Suspense` boundaries for async data loading
- State updates are batched automatically
