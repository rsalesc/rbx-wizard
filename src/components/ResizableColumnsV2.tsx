import React, { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface Column {
  id: string;
  content: ReactNode;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
}

interface ResizableColumnsV2Props {
  columns: Column[];
  className?: string;
  resizeHandleClassName?: string;
  direction?: 'horizontal' | 'vertical';
  onLayout?: (sizes: number[]) => void;
}

const ResizableColumnsV2: React.FC<ResizableColumnsV2Props> = ({
  columns,
  className = '',
  resizeHandleClassName = '',
  direction = 'horizontal',
  onLayout,
}) => {
  if (columns.length === 0) return null;

  return (
    <PanelGroup 
      direction={direction} 
      className={className}
      onLayout={onLayout}
    >
      {columns.map((column, index) => (
        <React.Fragment key={column.id}>
          <Panel
            id={column.id}
            defaultSize={column.defaultSize}
            minSize={column.minSize}
            maxSize={column.maxSize}
            className="overflow-hidden"
          >
            {column.content}
          </Panel>
          
          {/* Resize handle between panels */}
          {index < columns.length - 1 && (
            <PanelResizeHandle 
              className={`relative ${direction === 'horizontal' ? 'w-1' : 'h-1'} ${resizeHandleClassName}`}
            >
              <div 
                className={`
                  absolute inset-0 bg-gray-300 hover:bg-blue-500 transition-colors
                  ${direction === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize'}
                `} 
              />
            </PanelResizeHandle>
          )}
        </React.Fragment>
      ))}
    </PanelGroup>
  );
};

export default ResizableColumnsV2;
