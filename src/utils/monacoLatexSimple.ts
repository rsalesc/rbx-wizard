// Simplified LaTeX language configuration for Monaco Editor
export const registerSimpleLatexLanguage = (monaco: any) => {
  if (!monaco || !monaco.languages) {
    console.error('Monaco editor instance not available');
    return;
  }

  try {
    // Check if latex is already registered
    const languages = monaco.languages.getLanguages();
    const latexExists = languages.some((lang: any) => lang.id === 'latex');
    
    if (!latexExists) {
      // Register LaTeX language
      monaco.languages.register({ id: 'latex' });
      console.log('LaTeX language registered');

      // Set basic tokenizer
      monaco.languages.setMonarchTokensProvider('latex', {
        tokenizer: {
          root: [
            [/%.*$/, 'comment'],
            [/\\[a-zA-Z]+/, 'keyword'],
            [/\$/, 'delimiter'],
            [/{/, 'delimiter.bracket'],
            [/}/, 'delimiter.bracket'],
            [/\[/, 'delimiter.square'],
            [/\]/, 'delimiter.square'],
          ]
        }
      });
      console.log('LaTeX tokenizer set');

      // Set language configuration
      monaco.languages.setLanguageConfiguration('latex', {
        comments: {
          lineComment: '%'
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '$', close: '$' },
          { open: '"', close: '"' }
        ]
      });
      console.log('LaTeX language configuration set');
    } else {
      console.log('LaTeX language already registered');
    }
  } catch (error) {
    console.error('Error registering LaTeX language:', error);
  }
};
