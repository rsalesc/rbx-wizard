// LaTeX language configuration
export const registerLatexLanguage = (monaco: any) => {
  if (!monaco || !monaco.languages) {
    console.error('Monaco editor instance not available');
    return;
  }
  // Register a new language
  monaco.languages.register({ id: 'latex' });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider('latex', {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
      'begin', 'end', 'usepackage', 'documentclass', 'title', 'author', 'date',
      'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph',
      'chapter', 'part', 'item', 'enumerate', 'itemize', 'description',
      'label', 'ref', 'cite', 'bibliography', 'bibliographystyle',
      'newcommand', 'renewcommand', 'newenvironment', 'renewenvironment',
      'input', 'include', 'includegraphics', 'textbf', 'textit', 'emph',
      'underline', 'texttt', 'textsc', 'footnote', 'caption', 'table',
      'figure', 'equation', 'align', 'matrix', 'array', 'tabular',
      'verbatim', 'lstlisting', 'frac', 'sqrt', 'sum', 'int', 'prod',
      'lim', 'infty', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
      'theta', 'lambda', 'mu', 'pi', 'sigma', 'phi', 'omega'
    ],

    // The main tokenizer for our languages
    tokenizer: {
      root: [
        // Comments
        [/%.*$/, 'comment'],

        // Commands
        [/\\[a-zA-Z@]+/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'tag'
          }
        }],

        // Math mode
        [/\$\$/, { token: 'string', bracket: '@open', next: '@mathmode' }],
        [/\$/, { token: 'string', bracket: '@open', next: '@inlinemath' }],
        [/\\[[^\]]*\\]/, 'string'], // Display math with \[ \]
        [/\\([^)]*\\)/, 'string'], // Inline math with \( \)

        // Curly braces
        [/{/, { token: 'delimiter.curly', bracket: '@open' }],
        [/}/, { token: 'delimiter.curly', bracket: '@close' }],

        // Square brackets
        [/\[/, { token: 'delimiter.square', bracket: '@open' }],
        [/\]/, { token: 'delimiter.square', bracket: '@close' }],

        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, 'identifier'],

        // Numbers
        [/\d+/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],

      mathmode: [
        [/\$\$/, { token: 'string', bracket: '@close', next: '@pop' }],
        [/\\[a-zA-Z@]+/, 'keyword.math'],
        [/[^$]+/, 'string']
      ],

      inlinemath: [
        [/\$/, { token: 'string', bracket: '@close', next: '@pop' }],
        [/\\[a-zA-Z@]+/, 'keyword.math'],
        [/[^$]+/, 'string']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],
    },
  });

  // Define a new theme or extend existing one (commented out for now to avoid conflicts)
  /*
  monaco.editor.defineTheme('latex-theme', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'keyword.math', foreground: '008080', fontStyle: 'bold' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'string', foreground: 'FF00FF' },
      { token: 'tag', foreground: '0000FF' },
      { token: 'identifier', foreground: '000000' },
      { token: 'number', foreground: 'FF0000' },
    ],
    colors: {}
  });
  */

  // Register configuration for brackets and auto-closing pairs
  monaco.languages.setLanguageConfiguration('latex', {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '$', close: '$' },
      { open: '$$', close: '$$' },
      { open: '\\[', close: '\\]' },
      { open: '\\(', close: '\\)' },
      { open: '\\begin{', close: '}' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '$', close: '$' }
    ],
    comments: {
      lineComment: '%'
    }
  });

  // Add code snippets for common LaTeX structures
  monaco.languages.registerCompletionItemProvider('latex', {
    provideCompletionItems: () => {
      const suggestions = [
        {
          label: 'document',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\documentclass{${1:article}}\n\\usepackage{${2:amsmath}}\n\n\\title{${3:Title}}\n\\author{${4:Author}}\n\\date{${5:\\today}}\n\n\\begin{document}\n\\maketitle\n\n${0}\n\n\\end{document}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Create a basic LaTeX document structure'
        },
        {
          label: 'section',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\section{${1:Section Title}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a section'
        },
        {
          label: 'equation',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{equation}\n\t${1}\n\\end{equation}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert an equation environment'
        },
        {
          label: 'align',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{align}\n\t${1} &= ${2}\n\\end{align}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert an align environment'
        },
        {
          label: 'itemize',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{itemize}\n\t\\item ${1}\n\\end{itemize}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert an itemize environment'
        },
        {
          label: 'enumerate',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{enumerate}\n\t\\item ${1}\n\\end{enumerate}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert an enumerate environment'
        },
        {
          label: 'figure',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{figure}[${1:htbp}]\n\t\\centering\n\t\\includegraphics[width=${2:0.8\\textwidth}]{${3:filename}}\n\t\\caption{${4:Caption}}\n\t\\label{fig:${5:label}}\n\\end{figure}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a figure environment'
        },
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{table}[${1:htbp}]\n\t\\centering\n\t\\begin{tabular}{${2:|c|c|}}\n\t\t\\hline\n\t\t${3:Header 1} & ${4:Header 2} \\\\\\\n\t\t\\hline\n\t\t${5:Data 1} & ${6:Data 2} \\\\\\\n\t\t\\hline\n\t\\end{tabular}\n\t\\caption{${7:Caption}}\n\t\\label{tab:${8:label}}\n\\end{table}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a table environment'
        },
        {
          label: 'frac',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\frac{${1:numerator}}{${2:denominator}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a fraction'
        },
        {
          label: 'sqrt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\sqrt{${1}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a square root'
        }
      ];
      
      return { suggestions };
    }
  });
};

// Function to be called when initializing the editor
export const initializeMonacoLatex = (monaco: any) => {
  registerLatexLanguage(monaco);
};
