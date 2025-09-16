import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const rootClassName = [
    'prose',
    'prose-slate',
    'prose-sm',
    'md:prose-base',
    'max-w-none',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  // Check if the content is a single markdown code block and unwrap it
  const processedContent = (() => {
    const trimmedContent = content.trim();
    // Match a single markdown code block that starts and ends the entire content
    const singleCodeBlockMatch = trimmedContent.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
    
    if (singleCodeBlockMatch) {
      // Return the content inside the code block
      return singleCodeBlockMatch[1];
    }
    
    return content;
  })();

  return (
    <div className={rootClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            // For inline code only
            if (inline) {
              return (
                <code 
                  className="font-mono text-[0.85em] px-1.5 py-0.5 bg-gray-100 rounded-md" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // For code blocks, just return the code element
            // The pre element will be handled by the pre component
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }: any) => (
            <pre 
              className="not-prose bg-gray-50 text-gray-900 p-3 rounded-md border border-gray-200 my-4 overflow-visible whitespace-pre-wrap break-words" 
              {...props}
            >
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="not-prose overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left bg-gray-50 border border-gray-200 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top border border-gray-200">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;


