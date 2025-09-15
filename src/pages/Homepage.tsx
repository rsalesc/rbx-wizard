import React from 'react';
import ColumnManager from '../components/ColumnManager';
import DraggableColumns from '../components/DraggableColumns';
import { PERSISTENCE_KEYS } from '../state/types';

const Homepage: React.FC = () => {
  const clearLocalStorage = () => {
    localStorage.removeItem(PERSISTENCE_KEYS.APP_STATE);
    window.location.reload();
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">RBX Wizard</h1>
          
          {/* Column management controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={clearLocalStorage}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              title="Clear saved state and reload"
            >
              Clear State
            </button>
            <ColumnManager />
          </div>
        </div>
      </header>
      
      {/* Main Content - Resizable Columns with Drag and Drop */}
      <div className="flex-1 overflow-hidden">
        <DraggableColumns />
      </div>
    </div>
  );
};

export default Homepage;
