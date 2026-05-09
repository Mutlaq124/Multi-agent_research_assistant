/**
 * Centralized state management
 * Custom React hook for research operations.
 * Makes api call to /research, 
 * Manages state and API calls for research workflow.
 */
import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Message, ResearchRequest, Citation } from '../types';

interface ClientSettings {
  defaultModel?: string;
  apiKey?: string;
  customModel?: string;
}

const SETTINGS_STORAGE_KEY = 'mara_settings';

const readClientSettings = (): ClientSettings => {
  try {
    const rawValue = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawValue) return {};
    const parsed = JSON.parse(rawValue) as ClientSettings;
    return parsed ?? {};
  } catch {
    return {};
  }
};

interface UseResearchReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentThreadId: string | null;
  citations: Citation[];
  awaitingReview: boolean;
  executeResearch: (query: string) => Promise<void>;
  submitFeedback: (feedback: string, approved: boolean) => Promise<void>;
  clearMessages: () => void;
}

export const useResearch = (): UseResearchReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [awaitingReview, setAwaitingReview] = useState(false);

  const executeResearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const request: ResearchRequest = {
        query,
        thread_id: currentThreadId || undefined,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      };

      const clientSettings = readClientSettings();
      // Prioritize customModel over defaultModel selection
      const modelToUse = clientSettings.customModel?.trim() || clientSettings.defaultModel?.trim();

      if (modelToUse) {
        request.model = modelToUse;
      }
      if (clientSettings.apiKey?.trim()) {
        request.api_key = clientSettings.apiKey.trim();
      }

      const response = await apiService.executeResearch(request);

      // Store thread ID for conversation continuity
      setCurrentThreadId(response.thread_id);
      setCitations(response.citations || []);
      setAwaitingReview(response.status === 'awaiting_review');

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.report || 'Research completed but no report generated.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Research failed';
      setError(errorMessage);

      const errorResponse: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [currentThreadId, messages]);

  const submitFeedback = useCallback(async (feedback: string, approved: boolean) => {
    if (!currentThreadId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.submitFeedback(currentThreadId, { feedback, approved });
      setCurrentThreadId(response.thread_id);
      setCitations(response.citations || []);
      setAwaitingReview(response.status === 'awaiting_review');

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.report || 'Research updated.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feedback failed');
    } finally {
      setIsLoading(false);
    }
  }, [currentThreadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentThreadId(null);
    setCitations([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentThreadId,
    citations,
    awaitingReview,
    executeResearch,
    submitFeedback,
    clearMessages,
  };
};