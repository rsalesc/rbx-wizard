# API Library Documentation

This library provides a clean interface to interact with the API at `http://localhost:3000`.

## Configuration

The base URL can be configured in `/src/api/config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:3000';
```

## Basic Usage

### Using the API Client Directly

```typescript
import { apiClient } from '@/api';

// GET request
const data = await apiClient.get('/statements');

// POST request
const newStatement = await apiClient.post('/statements', {
  title: 'New Statement',
  description: 'Description here'
});

// PUT request
const updated = await apiClient.put('/statements/123', {
  title: 'Updated Title'
});

// DELETE request
await apiClient.delete('/statements/123');
```

### Using Service Methods

```typescript
import { statementsService } from '@/api';

// Get all statements
const statements = await statementsService.getStatements();

// Get single statement
const statement = await statementsService.getStatement('123');

// Create statement
const newStatement = await statementsService.createStatement({
  title: 'New Statement',
  description: 'Description'
});

// Update statement
const updated = await statementsService.updateStatement('123', {
  title: 'Updated Title'
});

// Delete statement
await statementsService.deleteStatement('123');
```

## React Hooks

### useStatements Hook

Fetches all statements with automatic loading and error states:

```typescript
import { useStatements } from '@/hooks';

function MyComponent() {
  const { data, loading, error, refetch } = useStatements();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(statement => (
        <div key={statement.id}>{statement.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useStatement Hook

Fetches a single statement by ID:

```typescript
import { useStatement } from '@/hooks';

function StatementDetail({ id }: { id: string }) {
  const { data, loading, error } = useStatement(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Statement not found</div>;

  return <div>{data.title}</div>;
}
```

### Mutation Hooks

For creating, updating, and deleting statements:

```typescript
import { useCreateStatement, useUpdateStatement, useDeleteStatement } from '@/hooks';

function StatementManager() {
  const createStatement = useCreateStatement();
  const updateStatement = useUpdateStatement('123');
  const deleteStatement = useDeleteStatement();

  // Create
  const handleCreate = async () => {
    const result = await createStatement.mutate({
      title: 'New Statement',
      description: 'Description'
    });
    
    if (result) {
      console.log('Created:', result);
    }
  };

  // Update
  const handleUpdate = async () => {
    const result = await updateStatement.mutate({
      title: 'Updated Title'
    });
  };

  // Delete
  const handleDelete = async (id: string) => {
    await deleteStatement.mutate(id);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createStatement.loading}>
        {createStatement.loading ? 'Creating...' : 'Create'}
      </button>
      
      {createStatement.error && <div>Error: {createStatement.error.message}</div>}
    </div>
  );
}
```

## Custom API Instance

You can create a custom API instance with different configuration:

```typescript
import { ApiClient } from '@/api';

const customApi = new ApiClient('https://api.example.com', {
  'Authorization': 'Bearer token',
  'Content-Type': 'application/json'
});

const data = await customApi.get('/endpoint');
```

## Types

All API types are exported from `/src/api/types.ts`:

```typescript
interface Statement {
  id: string;
  title: string;
  description?: string;
  filename?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}
```
