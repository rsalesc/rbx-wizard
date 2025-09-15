import React, { useState } from 'react';
import { useColumns } from '../state/hooks';
import { ColumnConfig } from '../state/types';
import { Button } from './common/Button';

const ColumnManager: React.FC = () => {
  const { columns, addColumn, removeColumn } = useColumns();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddStatementColumn = () => {
    const newColumn: ColumnConfig = {
      id: `statement-${Date.now()}`,
      type: 'statement',
      config: {
        selectedStatementId: null,
        viewMode: 'pdf',
      },
      minSize: 15,
      maxSize: 50,
      defaultSize: 25,
    };
    addColumn(newColumn);
  };

  const handleAddCodeEditorColumn = (templateType: 'validator' | 'checker' | 'interactor') => {
    const titles = {
      validator: 'Validator',
      checker: 'Checker',
      interactor: 'Interactor',
    };

    const newColumn: ColumnConfig = {
      id: `code-editor-${templateType}-${Date.now()}`,
      type: 'code-editor',
      config: {
        templateType,
        code: '',
        language: 'cpp',
        title: titles[templateType],
      },
      minSize: 20,
      maxSize: 60,
      defaultSize: 30,
    };
    addColumn(newColumn);
  };

  const handleRemoveColumn = (columnId: string) => {
    if (columns.length > 1) {
      removeColumn(columnId);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm"
      >
        Manage Columns ({columns.length})
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Column Management</h3>
            
            {/* Add Column Section */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Column</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleAddStatementColumn}
                  className="w-full text-sm"
                  variant="secondary"
                >
                  + Statement
                </Button>
                <Button
                  onClick={() => handleAddCodeEditorColumn('validator')}
                  className="w-full text-sm"
                  variant="secondary"
                >
                  + Validator
                </Button>
                <Button
                  onClick={() => handleAddCodeEditorColumn('checker')}
                  className="w-full text-sm"
                  variant="secondary"
                >
                  + Checker
                </Button>
                <Button
                  onClick={() => handleAddCodeEditorColumn('interactor')}
                  className="w-full text-sm"
                  variant="secondary"
                >
                  + Interactor
                </Button>
              </div>
            </div>

            {/* Current Columns Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Current Columns ({columns.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {column.type === 'statement' 
                        ? 'Statement Viewer' 
                        : (column as any).config.title}
                    </span>
                    <button
                      onClick={() => handleRemoveColumn(column.id)}
                      disabled={columns.length <= 1}
                      className={`text-sm px-2 py-1 rounded ${
                        columns.length <= 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ColumnManager;
