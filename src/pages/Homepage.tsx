import React from 'react';
import ColumnManager from '../components/ColumnManager';
import DraggableColumns from '../components/DraggableColumns';

const Homepage: React.FC = () => {

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">RBX Wizard</h1>
          
          {/* Column management controls */}
          <div className="flex items-center space-x-4">
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
