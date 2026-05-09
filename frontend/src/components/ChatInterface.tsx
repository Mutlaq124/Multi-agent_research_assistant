/**
 * Main chat interface for query input & research results display
 * Sends post (research) with query, thread_id & previous messages
 * Recieves md report (status, execution time, thread_id)
 * 
 */
import React, { useState, useRef, useEffect } from 'react';
import { useResearch } from '../hooks/useResearch';
import { MarkdownRenderer } from './MarkdownRenderer';
import { downloadTextFile } from '../utils/helpers';
import type { Citation as CitationType } from '../types';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    error,
    executeResearch,
    submitFeedback,
    clearMessages,
    citations: currentCitations,
    awaitingReview,
  } = useResearch();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, awaitingReview]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const query = input.trim();
    setInput('');
    await executeResearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold">Research Assistant</h2>
          <p className="text-sm text-slate-500">
            Ask complex AI questions, get concise research reports
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-200">
                Welcome to MARA Research Assistant
              </h3>
              <p className="text-slate-400 mb-8">
                Powered by multi-agent AI system using LangGraph. Ask complex
                AI research questions and receive concise reports with
                citations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-4xl ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-800'
                    } rounded-lg p-5 shadow-lg`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div>
                      <MarkdownRenderer content={message.content} />

                      {/* Citations Expander */}
                      {idx === messages.length - 1 && currentCitations && currentCitations.length > 0 && (
                        <div className="mt-6 border-t border-slate-800 pt-4">
                          <details className="group">
                            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-300 transition-colors uppercase tracking-wider flex items-center gap-2">
                              <span className="group-open:rotate-90 transition-transform">▶</span>
                              Sources & Citations ({currentCitations.length})
                            </summary>
                            <div className="mt-4 grid grid-cols-1 gap-3">
                              {currentCitations.map((cite: CitationType) => (
                                <div key={cite.id} className="p-3 bg-slate-950/50 rounded border border-slate-800 text-xs">
                                  <p className="text-slate-300 break-all">{cite.reference}</p>
                                  <p className="text-slate-600 mt-1 uppercase text-[10px]">Accessed: {cite.accessed}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => downloadTextFile(message.content, `MARA_Report_${new Date().getTime()}.md`)}
                          className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        >
                          Download .md
                        </button>
                        {idx === messages.length - 1 && (
                          <button
                            onClick={() => executeResearch('Regenerate previous response')}
                            className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                          >
                            Regenerate
                          </button>
                        )}
                      </div>

                      {/* Review Controls (Inside Assistant Bubble) */}
                      {idx === messages.length - 1 && awaitingReview && (
                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Human Review Required</h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            The agents have finished researching. Would you like to approve this report or request a specific revision?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitFeedback('', true)}
                              disabled={isLoading}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const feedback = prompt("What would you like to change?");
                                if (feedback) submitFeedback(feedback, false);
                              }}
                              disabled={isLoading}
                              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-3 p-5 bg-slate-900 rounded-lg border border-slate-800 max-w-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {messages.length % 2 === 0 ? "Agents are researching..." : "Synthesizing report..."}
                  </span>
                </div>
              </div>
            )}

            {/* Review Controls (Fallback Bottom UI) */}
            {awaitingReview && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="p-6 bg-blue-900/10 border border-blue-500/30 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <h4 className="font-semibold text-blue-400">Human Review Required</h4>
                </div>
                <p className="text-sm text-slate-400">
                  The report is ready for your review. You can approve it as is or provide feedback for revision.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => submitFeedback('', true)}
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-bold disabled:opacity-50"
                  >
                    Approve Report
                  </button>
                  <button
                    onClick={() => {
                      const feedback = prompt("What would you like to change?");
                      if (feedback) submitFeedback(feedback, false);
                    }}
                    disabled={isLoading}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-bold disabled:opacity-50"
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a research question about AI... (Shift+Enter for new line)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Patience is bitter, but its fruit is sweet. (Research queries take few seconds to complete)
        </p>
      </div>
    </div>
  );
};