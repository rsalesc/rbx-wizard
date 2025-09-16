import React, { Suspense, useState } from 'react';
import ResizableColumnsV2 from './ResizableColumnsV2';
import StatementViewer from './StatementViewer';
import CodeEditorColumn from './CodeEditorColumn';
import AssistantColumn from './AssistantColumn';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useColumns } from '../state/hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

const DraggableColumns: React.FC = () => {
  const { columns, setColumnSizes, updateColumnOrder } = useColumns();
  const [panelKey, setPanelKey] = useState(0);

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(columns, oldIndex, newIndex).map(col => col.id);
        updateColumnOrder(newOrder);
        // Force the PanelGroup to re-initialize with the new column order
        setPanelKey(prev => prev + 1);
      }
    }
  };

  // Transform columns data into ResizableColumnsV2 format
  const resizableColumns = columns.map((column) => ({
    id: column.id,
    content: (
      <Suspense fallback={<LoadingSpinner />}>
        {column.type === 'statement' ? (
          <StatementViewer 
            columnId={column.id}
            className="h-full"
            isDraggable
          />
        ) : column.type === 'code-editor' ? (
          <CodeEditorColumn
            columnId={column.id}
            className="h-full"
            isDraggable
          />
        ) : (
          <AssistantColumn
            columnId={column.id}
            className="h-full"
            isDraggable
          />
        )}
      </Suspense>
    ),
    minSize: column.minSize,
    maxSize: column.maxSize,
    defaultSize: column.defaultSize,
  }));

  const handleLayoutChange = (sizes: number[]) => {
    setColumnSizes(sizes);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map(col => col.id)}
        strategy={horizontalListSortingStrategy}
      >
        <ResizableColumnsV2
          key={panelKey}
          columns={resizableColumns}
          className="h-full"
          resizeHandleClassName="border-x border-gray-300"
          onLayout={handleLayoutChange}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DraggableColumns;
