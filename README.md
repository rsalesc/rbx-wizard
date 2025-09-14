# RBX Wizard

A simple static website with a two-column layout featuring a PDF viewer and code editor.

## Features

- **PDF Viewer** (left column) - Display and navigate through PDF documents
- **Code Editor** (right column) - Monaco Editor for writing and editing code
- **Responsive Design** - Built with Tailwind CSS for easy styling control

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

### Adding a PDF

To display a PDF in the viewer, add your PDF file to the `public` directory and name it `sample.pdf`. The PDF viewer will automatically load and display it.

### Code Editor

The code editor comes pre-configured with JavaScript syntax highlighting. You can modify the default language and theme in `src/pages/Homepage.tsx`.

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- react-pdf (PDF viewer)
- Monaco Editor (Code editor)

## Customization

- Modify the layout and styling using Tailwind CSS classes
- Change the default code editor language/theme in the Homepage component
- Update the PDF file path in the Document component if needed