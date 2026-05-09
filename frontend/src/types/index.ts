/**
 * TypeScript type definitions for the MARA frontend.
 * Ensures type safety across components and API interactions.
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Citation {
  id: number;
  reference: string;
  accessed: string;
}

export interface Source {
  type: 'web' | 'academic';
  title?: string;
  url?: string;
  content: string;
  score?: number;
}

export interface ResearchRequest {
  query: string;
  thread_id?: string;
  user_feedback?: string;
  model?: string;
  api_key?: string;
  messages?: Array<Pick<Message, 'role' | 'content'>>;
}

export interface ResearchResponse {
  thread_id: string;
  status: 'processing' | 'awaiting_review' | 'completed' | 'failed';
  report?: string;
  citations: Citation[];
  sources: Source[];
  execution_time?: number;
  estimated_cost?: number;
}

export interface SystemStats {
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  avg_latency: number;
  total_cost: number;
  active_users: number;
  queries_today: number;
}

export interface QueryHistory {
  id: number;
  thread_id: string;
  query: string;
  status: string;
  intent?: string;
  execution_time?: number;
  created_at: string;
}



export interface FeedbackRequest {
  feedback: string;
  approved: boolean;
}

export type TabType = 'chat' | 'dashboard' | 'history' | 'settings';