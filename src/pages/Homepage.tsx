import React from 'react';
import { PDFViewer, CodeEditorColumn, ResizableColumnsV2 } from '../components';

const Homepage: React.FC = () => {

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">RBX Wizard</h1>
      </header>

      {/* Main Content - Resizable Columns */}
      <div className="flex-1 overflow-hidden">
        <ResizableColumnsV2
          columns={[
            {
              id: 'pdf-viewer',
              content: (
                <PDFViewer 
                  pdfFile="http://localhost:8000/statement"
                  className="h-full"
                />
              ),
              minSize: 15,
              maxSize: 50,
              defaultSize: 30
            },
            {
              id: 'validator-editor',
              content: (
                <CodeEditorColumn
                  initialTemplate="validator"
                  title="Validator"
                  className="h-full"
                />
              ),
              minSize: 20,
              maxSize: 60,
              defaultSize: 35
            },
            {
              id: 'checker-editor',
              content: (
                <CodeEditorColumn
                  initialTemplate="checker"
                  title="Checker"
                  className="h-full"
                />
              ),
              minSize: 20,
              maxSize: 60,
              defaultSize: 35
            }
          ]}
          className="h-full"
          resizeHandleClassName="border-x border-gray-300"
        />
      </div>
    </div>
  );
};

export default Homepage;
