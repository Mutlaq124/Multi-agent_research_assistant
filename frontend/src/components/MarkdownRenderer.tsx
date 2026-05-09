/**
 * Renders markdown content with syntax highlighting and proper formatting.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-invert prose-slate max-w-none"
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-100 mt-6 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-slate-200 mt-5 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-300 mt-4 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {children}
          </a>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm">
              {children}
            </code>
          ) : (
            <code className="block bg-slate-800 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
              {children}
            </code>
          ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-slate-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-300">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-4">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-slate-700">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-700 bg-slate-800 px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-700 px-4 py-2">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};