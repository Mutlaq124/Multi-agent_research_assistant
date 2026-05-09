/**
 * API service for MARA frontend - No authentication.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  QueryHistory,
  ResearchRequest,
  ResearchResponse,
  SystemStats,
  FeedbackRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async executeResearch(request: ResearchRequest): Promise<ResearchResponse> {
    const response = await this.client.post<ResearchResponse>('/research', request);
    return response.data;
  }

  async getResearchResult(threadId: string): Promise<ResearchResponse> {
    const response = await this.client.get<ResearchResponse>(`/research/${threadId}`);
    return response.data;
  }

  async submitFeedback(threadId: string, feedback: FeedbackRequest): Promise<ResearchResponse> {
    const response = await this.client.post<ResearchResponse>(`/research/${threadId}/feedback`, feedback);
    return response.data;
  }

  async getSystemStats(): Promise<SystemStats> {
    const response = await this.client.get<SystemStats>('/admin/stats');
    return response.data;
  }

  async getQueryHistory(limit: number = 20): Promise<QueryHistory[]> {
    const response = await this.client.get<QueryHistory[]>('/admin/history', {
      params: { limit },
    });
    return response.data;
  }

  async checkHealth(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();